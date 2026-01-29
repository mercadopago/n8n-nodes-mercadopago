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

type ConfigureSettlementReportBody = {
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
 * - `settlementAdditionalFields`: separator, display timezone, translation, email
 *   notifications, and `scheduled` flag which defaults to false when missing.
 */
const handler: OperationHandler = async (ctx) => {
	// Required fields using shared helpers
	const columnsArr = parseColumns(ctx);
	const fileNamePrefix = parseFileNamePrefix(ctx);
	const frequency = parseFrequency(ctx);
	const sftpPayload = parseSftpInfo(ctx);

	// Additional fields (use a unique name in node UI to avoid collision)
	const additional = ctx.get<SettlementReportAdditionalFields>('settlementAdditionalFields', {});

	const body: ConfigureSettlementReportBody = {
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

	const response = await ctx.request({
		method: 'POST',
		url: API_ENDPOINTS.SETTLEMENT_REPORT_CONFIG,
		body,
	});

	return response;
};

export default handler;
