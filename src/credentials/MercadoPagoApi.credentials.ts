import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * MercadoPagoApi Credential
 *
 * This credential stores the Mercado Pago Access Token (Bearer) used by the
 * MercadoPago node to authenticate requests against Mercado Pago APIs.
 *
 * How to use:
 * - Create a credential in n8n with your Mercado Pago Access Token.
 * - Select this credential in the MercadoPago node before executing operations.
 *
 * Reference: https://www.mercadopago.com.ar/developers/es
 */

export class MercadoPagoApi implements ICredentialType {
	name = 'mercadoPagoApi';
	displayName = 'MercadoPago API';
	documentationUrl = 'https://www.mercadopago.com.br/developers/en/reference';
	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			default: '',
			required: true,
			description: 'The MercadoPago access token',
		},
	];
}