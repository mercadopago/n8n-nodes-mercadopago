import { MercadoPagoApi } from './credentials/MercadoPagoApi.credentials';
import { MercadoPago } from './nodes/MercadoPago/MercadoPago.node';

export const version = '0.1.0';

export const credentials = [
	{
		name: 'mercadoPagoApi',
		class: MercadoPagoApi,
	},
];

export const nodes = [
	{
		name: 'mercadoPago',
		class: MercadoPago,
	},
];