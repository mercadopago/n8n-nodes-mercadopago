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

type EditSettlementReportBody = {
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
const handler: OperationHandler = async (ctx) => {
	// Required fields using shared helpers
	const columnsArr = parseColumns(ctx);
	const fileNamePrefix = parseFileNamePrefix(ctx);
	const frequency = parseFrequency(ctx);
	const sftpPayload = parseSftpInfo(ctx);

	// Additional fields - using settlementAdditionalFields for Settlement Report
	const additional = ctx.get<SettlementReportAdditionalFields>('settlementAdditionalFields', {});

	const body: EditSettlementReportBody = {
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

	// Finally, send PUT update to settlement report config endpoint
	const response = await ctx.request({
		method: 'PUT',
		url: API_ENDPOINTS.SETTLEMENT_REPORT_CONFIG,
		body,
	});

	return response;
};

export default handler;
