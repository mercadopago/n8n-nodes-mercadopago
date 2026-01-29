"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_ITEMS_RETURN_ALL = void 0;
exports.parseColumns = parseColumns;
exports.parseFileNamePrefix = parseFileNamePrefix;
exports.parseFrequency = parseFrequency;
exports.parseSftpInfo = parseSftpInfo;
exports.parseEmails = parseEmails;
exports.extractResults = extractResults;
// ============================================================================
// Constants
// ============================================================================
exports.MAX_ITEMS_RETURN_ALL = 100000;
// ============================================================================
// Parsing Helpers
// ============================================================================
/**
 * Parses the columns collection from node UI into an array of { key: string }.
 * Supports both keySource/custom_key pattern and legacy key field.
 * Throws via ctx.nodeError if no valid columns are provided.
 */
function parseColumns(ctx, paramName = 'columns') {
    const columnsCollection = ctx.get(paramName);
    const columnsArr = (columnsCollection?.columnsValues ?? [])
        .map((c) => {
        const keySource = (c?.keySource ?? '').toString();
        const customKey = (c?.custom_key ?? '').toString().trim();
        const legacyKey = (c?.key ?? '').toString().trim();
        const key = keySource === 'custom' ? customKey : (keySource || legacyKey).toString().trim();
        return { key };
    })
        .filter((c) => c.key && c.key.length > 0);
    if (!columnsArr.length) {
        ctx.nodeError('At least one column with a non-empty "key" is required.');
    }
    return columnsArr;
}
/**
 * Parses the file_name_prefix parameter.
 * Throws via ctx.nodeError if empty.
 */
function parseFileNamePrefix(ctx, paramName = 'file_name_prefix') {
    const fileNamePrefix = (ctx.get(paramName, '') || '').toString().trim();
    if (!fileNamePrefix) {
        ctx.nodeError('"File Name Prefix" is required and cannot be empty.');
    }
    return fileNamePrefix;
}
/**
 * Parses the frequency collection from node UI.
 * Validates hour (0-23), value (> 0), and type (daily/weekly/monthly).
 * Throws via ctx.nodeError on validation failure.
 */
function parseFrequency(ctx, paramName = 'frequency') {
    const frequency = ctx.get(paramName);
    const freq = frequency?.frequencyValues ?? {};
    const hour = Number(freq.hour);
    const value = Number(freq.value);
    const type = (freq.type || '').toString();
    if (!Number.isFinite(hour) || hour < 0 || hour > 23) {
        ctx.nodeError('Frequency → hour must be an integer between 0 and 23.');
    }
    if (!Number.isFinite(value) || value <= 0) {
        ctx.nodeError('Frequency → value must be a positive integer.');
    }
    if (!['daily', 'weekly', 'monthly'].includes(type)) {
        ctx.nodeError("Frequency → type must be one of: 'daily', 'weekly', 'monthly'.");
    }
    return { hour, value, type };
}
/**
 * Parses the sftp_info collection from node UI.
 * Returns undefined if no valid SFTP fields are provided.
 * Prunes empty/undefined fields from the result.
 */
function parseSftpInfo(ctx, paramName = 'sftp_info') {
    const sftpInfo = ctx.get(paramName, undefined);
    const sftp = sftpInfo?.sftpInfoValues;
    if (!sftp || !Object.keys(sftp).length) {
        return undefined;
    }
    const sftpPayload = {
        server: (sftp.server ?? '').toString().trim() || undefined,
        password: (sftp.password ?? '').toString() || undefined,
        remote_dir: (sftp.remote_dir ?? '').toString().trim() || undefined,
        port: typeof sftp.port === 'number' ? sftp.port : undefined,
        username: (sftp.username ?? '').toString().trim() || undefined,
    };
    // Remove empty keys
    Object.keys(sftpPayload).forEach((k) => {
        const v = sftpPayload[k];
        if (v === undefined || v === '') {
            delete sftpPayload[k];
        }
    });
    return Object.keys(sftpPayload).length ? sftpPayload : undefined;
}
/**
 * Parses an email list from a notification_email_list collection.
 * Returns an array of non-empty email strings.
 */
function parseEmails(emailListParam) {
    const emails = emailListParam?.emails ?? [];
    return emails
        .map((e) => (e?.value ?? '').toString().trim())
        .filter((v) => v.length > 0);
}
// ============================================================================
// Response Extraction Helpers
// ============================================================================
/**
 * Extracts results array from API response.
 * Handles both direct array responses and { results: [...] } wrapped responses.
 */
function extractResults(res) {
    if (Array.isArray(res))
        return res;
    if (res && typeof res === 'object' && 'results' in res) {
        const maybe = res.results;
        return Array.isArray(maybe) ? maybe : [];
    }
    return [];
}
//# sourceMappingURL=utils.js.map