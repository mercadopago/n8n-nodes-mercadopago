import type { OperationHandler } from './index';
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
declare const handler: OperationHandler;
export default handler;
