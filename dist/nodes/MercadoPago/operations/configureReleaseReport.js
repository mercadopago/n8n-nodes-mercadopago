"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const utils_1 = require("./utils");
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
const handler = async (ctx) => {
    // Required fields using shared helpers
    const columnsArr = (0, utils_1.parseColumns)(ctx);
    const fileNamePrefix = (0, utils_1.parseFileNamePrefix)(ctx);
    const frequency = (0, utils_1.parseFrequency)(ctx);
    const sftpPayload = (0, utils_1.parseSftpInfo)(ctx);
    // Additional fields (use a unique name in node UI to avoid collision)
    const additional = ctx.get('configAdditionalFields', {});
    const body = {
        columns: columnsArr,
        file_name_prefix: fileNamePrefix,
        frequency,
        include_withdrawal_at_end: additional.include_withdrawal_at_end ?? false,
        check_available_balance: additional.check_available_balance ?? false,
        compensate_detail: additional.compensate_detail ?? false,
        execute_after_withdrawal: additional.execute_after_withdrawal ?? false,
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
        url: constants_1.API_ENDPOINTS.RELEASE_REPORT_CONFIG,
        body,
    });
    return response;
};
exports.default = handler;
//# sourceMappingURL=configureReleaseReport.js.map