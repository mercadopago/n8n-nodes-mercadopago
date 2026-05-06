import type { HandlerCtx } from './index';

// ============================================================================
// Shared Types
// ============================================================================

export type ColumnValue = {
	keySource?: string;
	custom_key?: string;
	key?: string;
};

export type ColumnsParam = {
	columnsValues?: ColumnValue[];
};

export type FrequencyValues = {
	hour?: number;
	value?: number;
	type?: string;
};

export type FrequencyParam = {
	frequencyValues?: FrequencyValues;
};

export type ParsedFrequency = {
	hour: number;
	value: number;
	type: string;
};

export type SftpInfoValues = {
	server?: string;
	username?: string;
	password?: string;
	remote_dir?: string;
	port?: number;
};


export type EmailValue = { value?: string };

export type EmailListParam = {
	emails?: EmailValue[];
};

// ============================================================================
// Constants
// ============================================================================

export const MAX_ITEMS_RETURN_ALL = 100000;

// ============================================================================
// Parsing Helpers
// ============================================================================

/**
 * Parses the columns collection from node UI into an array of { key: string }.
 * Supports both keySource/custom_key pattern and legacy key field.
 * Throws via ctx.nodeError if no valid columns are provided.
 */
export function parseColumns(ctx: HandlerCtx, paramName = 'columns'): Array<{ key: string }> {
	const columnsCollection = ctx.get<ColumnsParam>(paramName);
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
export function parseFileNamePrefix(ctx: HandlerCtx, paramName = 'file_name_prefix'): string {
	const fileNamePrefix = (ctx.get<string>(paramName, '') || '').toString().trim();
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
export function parseFrequency(ctx: HandlerCtx, paramName = 'frequency'): ParsedFrequency {
	const frequency = ctx.get<FrequencyParam>(paramName);
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
 * Builds the sftp_info payload from the SFTP credential only.
 *
 * For password: no trim is applied (passwords may contain leading/trailing spaces).
 * Returns undefined when no credential is configured or all fields are empty.
 */
export function parseSftpInfo(ctx: HandlerCtx): SftpInfoValues | undefined {
	const cred = ctx.sftpCredentials;
	if (!cred) return undefined;

	const sftpPayload: SftpInfoValues = {};

	const server = (cred.server ?? '').toString().trim();
	if (server) sftpPayload.server = server;

	const username = (cred.username ?? '').toString().trim();
	if (username) sftpPayload.username = username;

	// No trim on password — may contain intentional spaces
	const password = (cred.password ?? '').toString();
	if (password) sftpPayload.password = password;

	const remote_dir = (cred.remote_dir ?? '').toString().trim();
	if (remote_dir) sftpPayload.remote_dir = remote_dir;

	const port = typeof cred.port === 'number' && cred.port > 0 ? cred.port : undefined;
	if (port !== undefined) sftpPayload.port = port;

	return Object.keys(sftpPayload).length ? sftpPayload : undefined;
}

/**
 * Parses an email list from a notification_email_list collection.
 * Returns an array of non-empty email strings.
 */
export function parseEmails(emailListParam: EmailListParam | undefined): string[] {
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
export function extractResults(res: unknown): unknown[] {
	if (Array.isArray(res)) return res;
	if (res && typeof res === 'object' && 'results' in res) {
		const maybe = (res as { results?: unknown }).results;
		return Array.isArray(maybe) ? maybe : [];
	}
	return [];
}
