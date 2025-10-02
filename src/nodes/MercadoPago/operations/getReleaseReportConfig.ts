import type { OperationHandler } from './index';

/**
 * Get Release Report Configuration.
 *
 * Performs a GET request to retrieve the current Release Report configuration
 * for the authenticated account from `v1/account/release_report/config`.
 */
const handler: OperationHandler = async (ctx) => {
	const response = await ctx.request({
		method: 'GET',
		url: 'https://api.mercadopago.com/v1/account/release_report/config',
	});
	return response;
};

export default handler;
