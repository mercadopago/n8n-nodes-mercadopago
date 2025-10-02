import { ICredentialType, INodeProperties } from 'n8n-workflow';
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
export declare class MercadoPagoApi implements ICredentialType {
    name: string;
    displayName: string;
    documentationUrl: string;
    properties: INodeProperties[];
}
