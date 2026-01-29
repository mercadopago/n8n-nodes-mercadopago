"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const utils_1 = require("./utils");
/**
 * Edit Release Report Configuration.
 *
 * Validates and sends a PUT request to update the Release Report configuration
 * at `v1/account/release_report/config`. The input schema mirrors the creation
 * handler: `columns`, `file_name_prefix`, `frequency`, optional `sftp_info`,
 * and `configAdditionalFields`.
 *
 * Booleans are always included in the payload, defaulting to `false` when not
 * provided. Empty SFTP fields are pruned from the request body.
 */
const handler = async (ctx) => {
    // Required fields using shared helpers
    const columnsArr = (0, utils_1.parseColumns)(ctx);
    const fileNamePrefix = (0, utils_1.parseFileNamePrefix)(ctx);
    const frequency = (0, utils_1.parseFrequency)(ctx);
    const sftpPayload = (0, utils_1.parseSftpInfo)(ctx);
    // Additional fields
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
    // Finally, send PUT update
    const response = await ctx.request({
        method: 'PUT',
        url: constants_1.API_ENDPOINTS.RELEASE_REPORT_CONFIG,
        body,
    });
    return response;
};
exports.default = handler;
//# sourceMappingURL=editReleaseReportConfig.js.map