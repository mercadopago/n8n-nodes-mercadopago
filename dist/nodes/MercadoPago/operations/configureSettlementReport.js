"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const utils_1 = require("./utils");
/**
 * Configure Settlement Report.
 *
 * Builds and validates the payload to create/update the Settlement Report
 * generation preferences for the account, then POSTs to
 * `v1/account/settlement_report/config`.
 *
 * Required inputs:
 * - `columns`: at least one entry with a non-empty `key` (selected or custom).
 * - `file_name_prefix`: non-empty string used as report file prefix.
 * - `frequency`: object with `hour` (0-23), `value` (> 0) and `type` in
 *   ['daily', 'weekly', 'monthly'].
 *
 * Optional inputs:
 * - `sftp_info`: connection data; empty values are pruned.
 * - `settlementAdditionalFields`: separator, display timezone, translation, email
 *   notifications, and `scheduled` flag which defaults to false when missing.
 */
const handler = async (ctx) => {
    // Required fields using shared helpers
    const columnsArr = (0, utils_1.parseColumns)(ctx);
    const fileNamePrefix = (0, utils_1.parseFileNamePrefix)(ctx);
    const frequency = (0, utils_1.parseFrequency)(ctx);
    const sftpPayload = (0, utils_1.parseSftpInfo)(ctx);
    // Additional fields (use a unique name in node UI to avoid collision)
    const additional = ctx.get('settlementAdditionalFields', {});
    const body = {
        columns: columnsArr,
        file_name_prefix: fileNamePrefix,
        frequency,
        scheduled: additional.scheduled ?? false,
    };
    if (sftpPayload)
        body.sftp_info = sftpPayload;
    if (additional.separator)
        body.separator = additional.separator;
    if (additional.display_timezone)
        body.display_timezone = additional.display_timezone;
    if (additional.report_translation)
        body.report_translation = additional.report_translation;
    const emailList = (0, utils_1.parseEmails)(additional.notification_email_list);
    if (emailList.length)
        body.notification_email_list = emailList;
    const response = await ctx.request({
        method: 'POST',
        url: constants_1.API_ENDPOINTS.SETTLEMENT_REPORT_CONFIG,
        body,
    });
    return response;
};
exports.default = handler;
//# sourceMappingURL=configureSettlementReport.js.map