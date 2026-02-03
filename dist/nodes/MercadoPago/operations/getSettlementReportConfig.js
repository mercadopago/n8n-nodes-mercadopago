"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
/**
 * Get Settlement Report Configuration.
 *
 * Performs a GET request to retrieve the current Settlement Report configuration
 * for the authenticated account from `v1/account/settlement_report/config`.
 */
const handler = async (ctx) => {
    const response = await ctx.request({
        method: 'GET',
        url: constants_1.API_ENDPOINTS.SETTLEMENT_REPORT_CONFIG,
    });
    return response;
};
exports.default = handler;
//# sourceMappingURL=getSettlementReportConfig.js.map