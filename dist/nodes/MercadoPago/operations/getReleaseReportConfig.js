"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Get Release Report Configuration.
 *
 * Performs a GET request to retrieve the current Release Report configuration
 * for the authenticated account from `v1/account/release_report/config`.
 */
const handler = async (ctx) => {
    const response = await ctx.request({
        method: 'GET',
        url: 'https://api.mercadopago.com/v1/account/release_report/config',
    });
    return response;
};
exports.default = handler;
//# sourceMappingURL=getReleaseReportConfig.js.map