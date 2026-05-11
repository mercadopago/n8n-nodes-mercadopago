import type { OperationHandler } from './index';
import { API_ENDPOINTS } from '../../../constants';

/**
 * Download Release Report (CSV).
 *
 * Validates `file_name` and performs a GET request to
 * `v1/account/release_report/{file_name}` with `Accept: text/csv`.
 * Returns a JSON object with the file name, content type and raw CSV content
 * as a string, to keep the node output consistent.
 */
const handler: OperationHandler = async (ctx) => {
	const fileName = (ctx.get<string>('file_name', '') || '').toString().trim();
	if (!fileName) ctx.nodeError('Parameter "File Name" is required.');

	const url = API_ENDPOINTS.RELEASE_REPORT_DOWNLOAD(fileName);

	try {
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
	} catch (error) {
		const status = (error as { statusCode?: number; response?: { status?: number } })?.statusCode
			?? (error as { statusCode?: number; response?: { status?: number } })?.response?.status;
		if (status === 404) {
			ctx.apiError(error, {
				message: `Release Report file "${fileName}" was not found`,
				description: "Use 'Get Many Release Reports' to retrieve the available file names.",
			});
		}
		throw error;
	}
};

export default handler;
