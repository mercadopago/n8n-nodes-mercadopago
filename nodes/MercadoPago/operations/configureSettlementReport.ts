import type { OperationHandler } from './index';
import { API_ENDPOINTS } from '../../../constants';
import {
	parseColumns,
	parseFileNamePrefix,
	parseFrequency,
	parseSftpInfo,
	parseEmails,
	type SftpInfoValues,
	type EmailListParam,
} from './utils';

type SettlementReportAdditionalFields = {
	separator?: string;
	display_timezone?: string;
	report_translation?: string;
	notification_email_list?: EmailListParam;
	scheduled?: boolean;
};

type SettlementReportConfigBody = {
	columns: Array<{ key: string }>;
	file_name_prefix: string;
	frequency: { hour: number; value: number; type: string };
	sftp_info?: SftpInfoValues;
	separator?: string;
	display_timezone?: string;
	report_translation?: string;
	notification_email_list?: string[];
	scheduled: boolean;
};

/**
 * Configure Settlement Report (upsert).
 *
 * Creates or updates the Settlement Report configuration for the account.
 * Attempts POST first; if the configuration already exists (409), retries
 * with PUT to update it. The caller does not need to know whether a
 * configuration exists beforehand.
 *
 * Required inputs:
 * - `columns`: at least one entry with a non-empty `key`.
 * - `file_name_prefix`: non-empty string used as report file prefix.
 * - `frequency`: object with `hour` (0-23), `value` (> 0) and `type` in
 *   ['daily', 'weekly', 'monthly'].
 *
 * Optional inputs:
 * - SFTP credential: connection data for report delivery; empty values are pruned.
 * - `settlementAdditionalFields`: separator, display timezone, translation, email
 *   notifications, and scheduled flag which defaults to false when missing.
 */
const handler: OperationHandler = async (ctx) => {
	const columnsArr = parseColumns(ctx, 'columns', "Configure Settlement Report: please add at least one column using the 'Columns (Settlement)' field → 'Add Column'.");
	const fileNamePrefix = parseFileNamePrefix(ctx);
	const frequency = parseFrequency(ctx);
	const sftpPayload = parseSftpInfo(ctx);

	const additional = ctx.get<SettlementReportAdditionalFields>('settlementAdditionalFields', {});

	const body: SettlementReportConfigBody = {
		columns: columnsArr,
		file_name_prefix: fileNamePrefix,
		frequency,
		scheduled: additional.scheduled ?? false,
	};

	if (sftpPayload) body.sftp_info = sftpPayload;
	if (additional.separator) body.separator = additional.separator;
	if (additional.display_timezone) body.display_timezone = additional.display_timezone;
	if (additional.report_translation) body.report_translation = additional.report_translation;

	const emailList = parseEmails(additional.notification_email_list);
	if (emailList.length) body.notification_email_list = emailList;

	try {
		return await ctx.request({
			method: 'POST',
			url: API_ENDPOINTS.SETTLEMENT_REPORT_CONFIG,
			body,
		});
	} catch (error) {
		const status = (error as { statusCode?: number; response?: { status?: number } })?.statusCode
			?? (error as { statusCode?: number; response?: { status?: number } })?.response?.status;
		if (status === 409) {
			return await ctx.request({
				method: 'PUT',
				url: API_ENDPOINTS.SETTLEMENT_REPORT_CONFIG,
				body,
			});
		}
		throw error;
	}
};

export default handler;
