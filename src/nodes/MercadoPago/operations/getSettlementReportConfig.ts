import type { OperationHandler } from './index';
import { API_ENDPOINTS } from '../../../constants';

/**
 * Get Settlement Report Configuration.
 *
 * Performs a GET request to retrieve the current Settlement Report configuration
 * for the authenticated account from `v1/account/settlement_report/config`.
 */
const handler: OperationHandler = async (ctx) => {
	const response = await ctx.request({
		method: 'GET',
		url: API_ENDPOINTS.SETTLEMENT_REPORT_CONFIG,
	});
	return response;
};

export default handler;
