"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    // Read inputs (same schema as configureSettlementReport)
    const columnsCollection = ctx.get('columns');
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
    const fileNamePrefix = (ctx.get('file_name_prefix', '') || '').toString().trim();
    if (!fileNamePrefix) {
        ctx.nodeError('"File Name Prefix" is required and cannot be empty.');
    }
    const frequency = ctx.get('frequency');
    const freqVals = frequency?.frequencyValues ?? {};
    const hour = Number(freqVals.hour);
    const value = Number(freqVals.value);
    const type = (freqVals.type || '').toString();
    if (!Number.isFinite(hour) || hour < 0 || hour > 23)
        ctx.nodeError('Frequency → hour must be an integer between 0 and 23.');
    if (!Number.isFinite(value) || value <= 0)
        ctx.nodeError('Frequency → value must be a positive integer.');
    if (!['daily', 'weekly', 'monthly'].includes(type))
        ctx.nodeError("Frequency → type must be one of: 'daily', 'weekly', 'monthly'.");
    // sftp_info
    const sftpInfo = ctx.get('sftp_info', undefined);
    const sftp = sftpInfo?.sftpInfoValues;
    let sftpPayload;
    if (sftp && Object.keys(sftp).length) {
        sftpPayload = {
            server: (sftp.server ?? '').toString().trim() || undefined,
            password: (sftp.password ?? '').toString(),
            remote_dir: (sftp.remote_dir ?? '').toString().trim() || undefined,
            port: typeof sftp.port === 'number' ? sftp.port : undefined,
            username: (sftp.username ?? '').toString().trim() || undefined,
        };
        Object.keys(sftpPayload).forEach((k) => (sftpPayload[k] === undefined || sftpPayload[k] === '') && delete sftpPayload[k]);
        if (!Object.keys(sftpPayload).length)
            sftpPayload = undefined;
    }
    // Additional fields - using settlementAdditionalFields for Settlement Report
    const additional = ctx.get('settlementAdditionalFields', {});
    // Body like creation
    const body = {
        columns: columnsArr,
        file_name_prefix: fileNamePrefix,
        frequency: { hour, value, type },
    };
    if (sftpPayload)
        body.sftp_info = sftpPayload;
    if (additional.separator)
        body.separator = additional.separator;
    if (additional.display_timezone)
        body.display_timezone = additional.display_timezone;
    if (additional.report_translation)
        body.report_translation = additional.report_translation;
    const emails = additional.notification_email_list?.emails ?? [];
    if (emails.length) {
        const emailList = emails
            .map((e) => (e?.value ?? '').toString().trim())
            .filter((v) => v.length > 0);
        if (emailList.length)
            body.notification_email_list = emailList;
    }
    // Boolean with default - only scheduled for Settlement Report
    body.scheduled = additional.scheduled ?? false;
    // Finally, send PUT update to settlement report config endpoint
    const response = await ctx.request({
        method: 'PUT',
        url: 'https://api.mercadopago.com/v1/account/settlement_report/config',
        body,
    });
    return response;
};
exports.default = handler;
//# sourceMappingURL=editSettlementReport.js.map