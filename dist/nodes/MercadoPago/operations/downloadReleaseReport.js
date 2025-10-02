"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Download Release Report (CSV).
 *
 * Validates `file_name` and performs a GET request to
 * `v1/account/release_report/{file_name}` with `Accept: text/csv`.
 * Returns a JSON object with the file name, content type and raw CSV content
 * as a string, to keep the node output consistent.
 */
const handler = async (ctx) => {
    const fileName = (ctx.get('file_name', '') || '').toString().trim();
    if (!fileName)
        ctx.nodeError('Parameter "File Name" is required.');
    const url = `https://api.mercadopago.com/v1/account/release_report/${encodeURIComponent(fileName)}`;
    // Request CSV as plain text
    const response = await ctx.request({
        method: 'GET',
        url,
        json: false,
        headers: { Accept: 'text/csv' },
    });
    // Return as JSON wrapper to keep node output consistent
    return {
        file_name: fileName,
        content_type: 'text/csv',
        content: typeof response === 'string' ? response : String(response),
    };
};
exports.default = handler;
//# sourceMappingURL=downloadReleaseReport.js.map