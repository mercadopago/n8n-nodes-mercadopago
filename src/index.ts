import { MercadoPagoApi } from './credentials/MercadoPagoApi.credentials';
import { MercadoPagoSftp } from './credentials/MercadoPagoSftp.credentials';
import { MercadoPago } from './nodes/MercadoPago/MercadoPago.node';

export const credentials = [
	{
		name: 'mercadoPagoApi',
		class: MercadoPagoApi,
	},
	{
		name: 'mercadoPagoSftp',
		class: MercadoPagoSftp,
	},
];

export const nodes = [
	{
		name: 'mercadoPago',
		class: MercadoPago,
	},
];