/**
 * Constants used across the application
 */
/**
 * HTTP Headers
 */
export declare const HTTP_HEADERS: {
    /**
     * Platform identifier for MercadoPago API requests
     */
    X_PLATFORM_ID: string;
};
/**
 * MercadoPago API Base URL
 */
export declare const API_BASE_URL = "https://api.mercadopago.com";
/**
 * API Endpoints
 */
export declare const API_ENDPOINTS: {
    CHECKOUT_PREFERENCES: string;
    RELEASE_REPORT_LIST: string;
    RELEASE_REPORT_CONFIG: string;
    RELEASE_REPORT_DOWNLOAD: (fileName: string) => string;
    SETTLEMENT_REPORT_LIST: string;
    SETTLEMENT_REPORT_CONFIG: string;
    SETTLEMENT_REPORT_DOWNLOAD: (fileName: string) => string;
};
