import type { OperationHandler } from './index';
/**
 * Configure Release Report.
 *
 * Builds and validates the payload to create/update the Release Report
 * generation preferences for the account, then POSTs to
 * `v1/account/release_report/config`.
 *
 * Required inputs:
 * - `columns`: at least one entry with a non-empty `key` (selected or custom).
 * - `file_name_prefix`: non-empty string used as report file prefix.
 * - `frequency`: object with `hour` (0-23), `value` (> 0) and `type` in
 *   ['daily', 'weekly', 'monthly'].
 *
 * Optional inputs:
 * - `sftp_info`: connection data; empty values are pruned.
 * - `configAdditionalFields`: separator, display timezone, translation, email
 *   notifications, and boolean flags which default to false when missing.
 */
declare const handler: OperationHandler;
export default handler;
