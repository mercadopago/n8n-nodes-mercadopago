"use strict";
/**
 * Constants used across the application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_ENDPOINTS = exports.API_BASE_URL = exports.HTTP_HEADERS = void 0;
/**
 * HTTP Headers
 */
exports.HTTP_HEADERS = {
    /**
     * Platform identifier for MercadoPago API requests
     */
    X_PLATFORM_ID: 'platform-id',
};
/**
 * MercadoPago API Base URL
 */
exports.API_BASE_URL = 'https://api.mercadopago.com';
/**
 * API Endpoints
 */
exports.API_ENDPOINTS = {
    // Checkout Preferences
    CHECKOUT_PREFERENCES: `${exports.API_BASE_URL}/checkout/preferences`,
    // Release Report
    RELEASE_REPORT_LIST: `${exports.API_BASE_URL}/v1/account/release_report/list`,
    RELEASE_REPORT_CONFIG: `${exports.API_BASE_URL}/v1/account/release_report/config`,
    RELEASE_REPORT_DOWNLOAD: (fileName) => `${exports.API_BASE_URL}/v1/account/release_report/${encodeURIComponent(fileName)}`,
    // Settlement Report
    SETTLEMENT_REPORT_LIST: `${exports.API_BASE_URL}/v1/account/settlement_report/list`,
    SETTLEMENT_REPORT_CONFIG: `${exports.API_BASE_URL}/v1/account/settlement_report/config`,
    SETTLEMENT_REPORT_DOWNLOAD: (fileName) => `${exports.API_BASE_URL}/v1/account/settlement_report/${encodeURIComponent(fileName)}`,
};
//# sourceMappingURL=constants.js.map