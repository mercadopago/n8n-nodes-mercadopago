import type { OperationHandler } from './index';

/**
 * Get Settlement Report Configuration.
 *
 * Performs a GET request to retrieve the current Settlement Report configuration
 * for the authenticated account from `v1/account/settlement_report/config`.
 */
const handler: OperationHandler = async (ctx) => {
	const response = await ctx.request({
		method: 'GET',
		url: 'https://api.mercadopago.com/v1/account/settlement_report/config',
	});
	return response;
};

export default handler;
