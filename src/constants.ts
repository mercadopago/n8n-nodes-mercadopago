/**
 * Constants used across the application
 */

/**
 * HTTP Headers
 */
export const HTTP_HEADERS = {
  /**
   * Platform identifier for MercadoPago API requests
   */
  X_PLATFORM_ID: 'dev_ab62552b980e11f0a15e121bc09c588a',
};

/**
 * MercadoPago API Base URL
 */
export const API_BASE_URL = 'https://api.mercadopago.com';

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Checkout Preferences
  CHECKOUT_PREFERENCES: `${API_BASE_URL}/checkout/preferences`,

  // Release Report
  RELEASE_REPORT_LIST: `${API_BASE_URL}/v1/account/release_report/list`,
  RELEASE_REPORT_CONFIG: `${API_BASE_URL}/v1/account/release_report/config`,
  RELEASE_REPORT_DOWNLOAD: (fileName: string) =>
    `${API_BASE_URL}/v1/account/release_report/${encodeURIComponent(fileName)}`,

  // Settlement Report
  SETTLEMENT_REPORT_LIST: `${API_BASE_URL}/v1/account/settlement_report/list`,
  SETTLEMENT_REPORT_CONFIG: `${API_BASE_URL}/v1/account/settlement_report/config`,
  SETTLEMENT_REPORT_DOWNLOAD: (fileName: string) =>
    `${API_BASE_URL}/v1/account/settlement_report/${encodeURIComponent(fileName)}`,
};
