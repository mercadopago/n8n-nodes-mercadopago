import { MercadoPagoApi } from './credentials/MercadoPagoApi.credentials';
import { MercadoPago } from './nodes/MercadoPago/MercadoPago.node';
export declare const version = "0.1.0";
export declare const credentials: {
    name: string;
    class: typeof MercadoPagoApi;
}[];
export declare const nodes: {
    name: string;
    class: typeof MercadoPago;
}[];
