import type { OperationHandler } from './index';
/**
 * Download Release Report (CSV).
 *
 * Validates `file_name` and performs a GET request to
 * `v1/account/release_report/{file_name}` with `Accept: text/csv`.
 * Returns a JSON object with the file name, content type and raw CSV content
 * as a string, to keep the node output consistent.
 */
declare const handler: OperationHandler;
export default handler;
