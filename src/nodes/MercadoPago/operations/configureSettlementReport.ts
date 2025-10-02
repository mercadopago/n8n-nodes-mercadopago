import type { OperationHandler } from './index';

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
 * - `configAdditionalFields`: separator, display timezone, translation, email
 *   notifications, and `scheduled` flag which defaults to false when missing.
 */
const handler: OperationHandler = async (ctx) => {
	// Required: columns
	const columnsCollection = ctx.get('columns') as { columnsValues: Array<Record<string, any>> };
	const columnsArr = (columnsCollection?.columnsValues ?? [])
		.map((c) => {
			const keySource = (c?.keySource ?? '').toString();
			const customKey = (c?.custom_key ?? '').toString().trim();
			// Fallback to legacy 'key' if present
			const legacyKey = (c?.key ?? '').toString().trim();
			const key = keySource === 'custom' ? customKey : (keySource || legacyKey).toString().trim();
			return { key };
		})
		.filter((c) => c.key && c.key.length > 0);
	if (!columnsArr.length) {
		ctx.nodeError('At least one column with a non-empty "key" is required.');
	}

	// Required: file_name_prefix
	const fileNamePrefix = (ctx.get<string>('file_name_prefix', '') || '').toString().trim();
	if (!fileNamePrefix) {
		ctx.nodeError('"File Name Prefix" is required and cannot be empty.');
	}

	// Required: frequency
	const frequency = ctx.get('frequency') as { frequencyValues?: { hour?: number; value?: number; type?: string } };
	const freq = frequency?.frequencyValues ?? {};
	const hour = Number(freq.hour);
	const value = Number(freq.value);
	const type = (freq.type || '').toString();
	if (!Number.isFinite(hour) || hour < 0 || hour > 23) ctx.nodeError('Frequency → hour must be an integer between 0 and 23.');
	if (!Number.isFinite(value) || value <= 0) ctx.nodeError('Frequency → value must be a positive integer.');
	if (!['daily', 'weekly', 'monthly'].includes(type)) ctx.nodeError("Frequency → type must be one of: 'daily', 'weekly', 'monthly'.");

	// Optional: sftp_info
	const sftpInfo = ctx.get('sftp_info', undefined) as { sftpInfoValues?: { server?: string; password?: string; remote_dir?: string; port?: number; username?: string } } | undefined;
	const sftp = sftpInfo?.sftpInfoValues;
	let sftpPayload: any | undefined;
	if (sftp && Object.keys(sftp).length) {
		sftpPayload = {
			server: (sftp.server ?? '').toString().trim() || undefined,
			password: (sftp.password ?? '').toString(),
			remote_dir: (sftp.remote_dir ?? '').toString().trim() || undefined,
			port: typeof sftp.port === 'number' ? sftp.port : undefined,
			username: (sftp.username ?? '').toString().trim() || undefined,
		};
		// Remove empty keys
		Object.keys(sftpPayload).forEach((k) => (sftpPayload[k] === undefined || sftpPayload[k] === '') && delete sftpPayload[k]);
		if (!Object.keys(sftpPayload).length) sftpPayload = undefined;
	}

	// Additional fields (use a unique name in node UI to avoid collision)
	const additional = ctx.get('settlementAdditionalFields', {}) as {
		separator?: string;
		display_timezone?: string;
		report_translation?: string;
		notification_email_list?: { emails?: Array<{ value: string }> };
		scheduled?: boolean;
	};

	const body: Record<string, any> = {
		columns: columnsArr,
		file_name_prefix: fileNamePrefix,
		frequency: { hour, value, type },
	};

	if (sftpPayload) body.sftp_info = sftpPayload;
	if (additional.separator) body.separator = additional.separator;
	if (additional.display_timezone) body.display_timezone = additional.display_timezone;
	if (additional.report_translation) body.report_translation = additional.report_translation;

	const emails = additional.notification_email_list?.emails ?? [];
	if (emails.length) {
		const emailList = emails
			.map((e) => (e?.value ?? '').toString().trim())
			.filter((v) => v.length > 0);
		if (emailList.length) body.notification_email_list = emailList;
	}

	// Boolean with default
	body.scheduled = additional.scheduled ?? false;

	const response = await ctx.request({
		method: 'POST',
		url: 'https://api.mercadopago.com/v1/account/settlement_report/config',
		body,
	});

	return response;
};

export default handler;
