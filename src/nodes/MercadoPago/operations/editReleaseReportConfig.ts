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

type ReleaseReportAdditionalFields = {
	separator?: string;
	display_timezone?: string;
	report_translation?: string;
	notification_email_list?: EmailListParam;
	include_withdrawal_at_end?: boolean;
	check_available_balance?: boolean;
	compensate_detail?: boolean;
	execute_after_withdrawal?: boolean;
	scheduled?: boolean;
};

type EditReleaseReportBody = {
	columns: Array<{ key: string }>;
	file_name_prefix: string;
	frequency: { hour: number; value: number; type: string };
	sftp_info?: SftpInfoValues;
	separator?: string;
	display_timezone?: string;
	report_translation?: string;
	notification_email_list?: string[];
	include_withdrawal_at_end: boolean;
	check_available_balance: boolean;
	compensate_detail: boolean;
	execute_after_withdrawal: boolean;
	scheduled: boolean;
};

/**
 * Edit Release Report Configuration.
 *
 * Validates and sends a PUT request to update the Release Report configuration
 * at `v1/account/release_report/config`. The input schema mirrors the creation
 * handler: `columns`, `file_name_prefix`, `frequency`, optional `sftp_info`,
 * and `configAdditionalFields`.
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

	// Additional fields
	const additional = ctx.get<ReleaseReportAdditionalFields>('configAdditionalFields', {});

	const body: EditReleaseReportBody = {
		columns: columnsArr,
		file_name_prefix: fileNamePrefix,
		frequency,
		include_withdrawal_at_end: additional.include_withdrawal_at_end ?? false,
		check_available_balance: additional.check_available_balance ?? false,
		compensate_detail: additional.compensate_detail ?? false,
		execute_after_withdrawal: additional.execute_after_withdrawal ?? false,
		scheduled: additional.scheduled ?? false,
	};

	if (sftpPayload) body.sftp_info = sftpPayload;
	if (additional.separator) body.separator = additional.separator;
	if (additional.display_timezone) body.display_timezone = additional.display_timezone;
	if (additional.report_translation) body.report_translation = additional.report_translation;

	const emailList = parseEmails(additional.notification_email_list);
	if (emailList.length) body.notification_email_list = emailList;

	// Finally, send PUT update
	const response = await ctx.request({
		method: 'PUT',
		url: API_ENDPOINTS.RELEASE_REPORT_CONFIG,
		body,
	});

	return response;
};

export default handler;
