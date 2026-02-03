"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
/**
 * Get Release Report Configuration.
 *
 * Performs a GET request to retrieve the current Release Report configuration
 * for the authenticated account from `v1/account/release_report/config`.
 */
const handler = async (ctx) => {
    const response = await ctx.request({
        method: 'GET',
        url: constants_1.API_ENDPOINTS.RELEASE_REPORT_CONFIG,
    });
    return response;
};
exports.default = handler;
//# sourceMappingURL=getReleaseReportConfig.js.map