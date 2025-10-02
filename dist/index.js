"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodes = exports.credentials = exports.version = void 0;
const MercadoPagoApi_credentials_1 = require("./credentials/MercadoPagoApi.credentials");
const MercadoPago_node_1 = require("./nodes/MercadoPago/MercadoPago.node");
exports.version = '0.1.0';
exports.credentials = [
    {
        name: 'mercadoPagoApi',
        class: MercadoPagoApi_credentials_1.MercadoPagoApi,
    },
];
exports.nodes = [
    {
        name: 'mercadoPago',
        class: MercadoPago_node_1.MercadoPago,
    },
];
//# sourceMappingURL=index.js.map