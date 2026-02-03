"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const utils_1 = require("./utils");
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
const handler = async (ctx) => {
    // Required fields using shared helpers
    const columnsArr = (0, utils_1.parseColumns)(ctx);
    const fileNamePrefix = (0, utils_1.parseFileNamePrefix)(ctx);
    const frequency = (0, utils_1.parseFrequency)(ctx);
    const sftpPayload = (0, utils_1.parseSftpInfo)(ctx);
    // Additional fields - using settlementAdditionalFields for Settlement Report
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
    // Finally, send PUT update to settlement report config endpoint
    const response = await ctx.request({
        method: 'PUT',
        url: constants_1.API_ENDPOINTS.SETTLEMENT_REPORT_CONFIG,
        body,
    });
    return response;
};
exports.default = handler;
//# sourceMappingURL=editSettlementReport.js.map