import type { OperationHandler } from './index';
/**
 * Edit Settlement Report Configuration.
 *
 * Validates and sends a PUT request to update the Settlement Report configuration
 * at `v1/account/settlement_report/config`. The input schema mirrors the creation
 * handler: `columns`, `file_name_prefix`, `frequency`, optional `sftp_info`,
 * and `settlementAdditionalFields`.
 *
 * Booleans are always included in the payload, defaulting to `false` when not
 * provided. Empty SFTP fields are pruned from the request body.
 */
declare const handler: OperationHandler;
export default handler;
