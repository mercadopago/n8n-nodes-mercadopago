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

export type SftpInfoParam = {
	sftpInfoValues?: SftpInfoValues;
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
 * Parses the sftp_info collection from node UI and merges with SFTP credentials.
 *
 * Priority (highest wins):
 *   1. Non-empty node parameter value (supports dynamic expressions)
 *   2. Value from the SFTP credential (encrypted at rest by n8n)
 *   3. undefined (field omitted from payload)
 *
 * For port: 0 means "use credential value" (default in UI).
 * For password: no trim is applied (passwords may contain leading/trailing spaces).
 *
 * Backward compatible: if `ctx.sftpCredentials` is undefined, behaves identically
 * to the previous implementation.
 */
export function parseSftpInfo(ctx: HandlerCtx, paramName = 'sftp_info'): SftpInfoValues | undefined {
	const sftpInfo = ctx.get<SftpInfoParam | undefined>(paramName, undefined);
	const sftp = sftpInfo?.sftpInfoValues;
	const cred = ctx.sftpCredentials;

	// Helper: resolve a string field — param wins over credential, empty/whitespace = absent
	const str = (paramVal: unknown, credVal: unknown): string | undefined => {
		const p = (paramVal ?? '').toString().trim();
		if (p) return p;
		const c = (credVal ?? '').toString().trim();
		return c || undefined;
	};

	// Helper: resolve password — no trim (passwords may have intentional spaces)
	const pwd = (paramVal: unknown, credVal: unknown): string | undefined => {
		const p = (paramVal ?? '').toString();
		if (p) return p;
		const c = (credVal ?? '').toString();
		return c || undefined;
	};

	const server = str(sftp?.server, cred?.server);
	const username = str(sftp?.username, cred?.username);
	const password = pwd(sftp?.password, cred?.password);
	const remote_dir = str(sftp?.remote_dir, cred?.remote_dir);

	// Port: 0 means "use credential value"; any positive param value wins
	const paramPort = typeof sftp?.port === 'number' ? sftp.port : 0;
	const credPort = typeof cred?.port === 'number' ? cred.port : 0;
	const port = paramPort > 0 ? paramPort : (credPort > 0 ? credPort : undefined);

	const sftpPayload: SftpInfoValues = {};
	if (server !== undefined) sftpPayload.server = server;
	if (username !== undefined) sftpPayload.username = username;
	if (password !== undefined) sftpPayload.password = password;
	if (remote_dir !== undefined) sftpPayload.remote_dir = remote_dir;
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
