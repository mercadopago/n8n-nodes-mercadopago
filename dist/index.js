"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodes = exports.credentials = void 0;
const MercadoPagoApi_credentials_1 = require("./credentials/MercadoPagoApi.credentials");
const MercadoPagoSftp_credentials_1 = require("./credentials/MercadoPagoSftp.credentials");
const MercadoPago_node_1 = require("./nodes/MercadoPago/MercadoPago.node");
exports.credentials = [
    {
        name: 'mercadoPagoApi',
        class: MercadoPagoApi_credentials_1.MercadoPagoApi,
    },
    {
        name: 'mercadoPagoSftp',
        class: MercadoPagoSftp_credentials_1.MercadoPagoSftp,
    },
];
exports.nodes = [
    {
        name: 'mercadoPago',
        class: MercadoPago_node_1.MercadoPago,
    },
];
//# sourceMappingURL=index.js.map