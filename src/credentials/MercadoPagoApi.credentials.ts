import {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class MercadoPagoApi implements ICredentialType {
	name = 'mercadoPagoApi';
	displayName = 'MercadoPago API';
	documentationUrl = 'https://www.mercadopago.com.br/developers/en/reference';
	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The MercadoPago access token',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.mercadopago.com',
			url: '/v1/payment_methods',
			method: 'GET',
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
			},
		},
	};
}
