import type { OperationHandler } from './index';
import { API_ENDPOINTS } from '../../../constants';

/**
 * Download Settlement Report (CSV).
 *
 * Validates `file_name` and performs a GET request to
 * `v1/account/settlement_report/{file_name}` with `Accept: text/csv`.
 * Returns a JSON object with the file name, content type and raw CSV content
 * as a string, to keep the node output consistent.
 */
const handler: OperationHandler = async (ctx) => {
	const fileName = (ctx.get<string>('file_name', '') || '').toString().trim();
	if (!fileName) ctx.nodeError('Parameter "File Name" is required.');

	const url = API_ENDPOINTS.SETTLEMENT_REPORT_DOWNLOAD(fileName);

	// Request CSV as plain text
	const response = await ctx.request({
		method: 'GET',
		url,
		json: false,
		headers: { Accept: 'text/csv' },
	});

	return {
		file_name: fileName,
		content_type: 'text/csv',
		content: typeof response === 'string' ? response : String(response),
	};
};

export default handler;
