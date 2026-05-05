"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MercadoPagoApi = void 0;
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
                typeOptions: {
                    password: true,
                },
                default: '',
                required: true,
                description: 'The MercadoPago access token',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    Authorization: '=Bearer {{$credentials.accessToken}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: 'https://api.mercadopago.com',
                url: '/v1/payment_methods',
                method: 'GET',
            },
        };
    }
}
exports.MercadoPagoApi = MercadoPagoApi;
//# sourceMappingURL=MercadoPagoApi.credentials.js.map