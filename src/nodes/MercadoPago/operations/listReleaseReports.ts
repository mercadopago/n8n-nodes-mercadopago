import type { OperationHandler } from './index';

/**
 * List Release Reports.
 *
 * Paginates over `v1/account/release_report/list` to return all results when
 * `returnAll` is true; otherwise requests a single page and trims to `limit`.
 *
 * Parameters read from the node UI:
 * - `returnAll` (boolean): if true, fetches pages until exhausted.
 * - `limit` (number): maximum results to output when `returnAll` is false.
 * - `reportFilters` (collection): supports `offset` and `apiLimit` (page size).
 */
const handler: OperationHandler = async (ctx) => {
	const returnAll = ctx.get<boolean>('returnAll', true);
	const limit = ctx.get<number>('limit', 100);
	const filters = ctx.get<{ offset?: number; apiLimit?: number }>('reportFilters', {});
	const pageSize = Math.min(Math.max(filters?.apiLimit ?? 200, 1), 1000);
	let offset = Math.max(filters?.offset ?? 0, 0);

	const baseRequest = (qs: Record<string, any>) =>
		ctx.request({
			method: 'GET',
			url: 'https://api.mercadopago.com/v1/account/release_report/list',
			qs,
		});

	if (returnAll) {
		const out: any[] = [];
		while (true) {
			const res = await baseRequest({ offset, limit: pageSize });
			const batch = Array.isArray(res) ? res : (Array.isArray(res?.results) ? res.results : []);
			out.push(...batch);
			if (!batch.length || batch.length < pageSize) break;
			offset += pageSize;
			if (out.length > 100000) break; // guard rail
		}
		return out;
	}

	// returnAll = false → una sola página y recorte
	const res = await baseRequest({ offset, limit: Math.min(pageSize, limit) });
	const batch = Array.isArray(res) ? res : (Array.isArray(res?.results) ? res.results : []);
	return batch.slice(0, limit);
};

export default handler;
