"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MercadoPagoApi = void 0;
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
class MercadoPagoApi {
    constructor() {
        this.name = 'mercadoPagoApi';
        this.displayName = 'MercadoPago API';
        this.documentationUrl = 'https://www.mercadopago.com.br/developers/en/reference';
        this.properties = [
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
}
exports.MercadoPagoApi = MercadoPagoApi;
//# sourceMappingURL=MercadoPagoApi.credentials.js.map