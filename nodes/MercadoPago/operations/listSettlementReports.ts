import type { OperationHandler } from './index';
import { API_ENDPOINTS } from '../../../constants';
import { extractResults, MAX_ITEMS_RETURN_ALL } from './utils';

type ListQuery = {
	offset: number;
	limit: number;
};

/**
 * List Settlement Reports.
 *
 * Paginates over `v1/account/settlement_report/list` to return all results when
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

	const baseRequest = (qs: ListQuery) =>
		ctx.request<unknown>({
			method: 'GET',
			url: API_ENDPOINTS.SETTLEMENT_REPORT_LIST,
			qs,
		});

	if (returnAll) {
		const out: unknown[] = [];
		while (true) {
			const res = await baseRequest({ offset, limit: pageSize });
			const batch = extractResults(res);
			out.push(...batch);
			if (!batch.length || batch.length < pageSize) break;
			offset += pageSize;
			if (out.length > MAX_ITEMS_RETURN_ALL) break; // guard rail
		}
		return out;
	}

	// returnAll = false → una sola página y recorte
	const res = await baseRequest({ offset, limit: Math.min(pageSize, limit) });
	const batch = extractResults(res);
	return batch.slice(0, limit);
};

export default handler;
