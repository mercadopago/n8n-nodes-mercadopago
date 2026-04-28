"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MercadoPago = void 0;
// src/nodes/mercadopago/MercadoPago.node.ts
const n8n_workflow_1 = require("n8n-workflow");
const constants_1 = require("../../constants");
const operations_1 = require("./operations");
/**
 * n8n node: MercadoPago
 *
 * Exposes a set of operations grouped under two resources:
 * - `payments`: Create payment link (Checkout Preference).
 * - `reporting`: List, configure and download Release/Settlement reports.
 *
 * This class wires node UI properties to concrete operation handlers in
 * `./operations`, centralizes credential loading, and standardizes request
 * headers (Bearer auth + optional JSON). Errors are thrown using
 * `NodeOperationError` with item context.
 */
class MercadoPago {
    constructor() {
        this.description = {
            displayName: 'MercadoPago',
            name: 'mercadoPago',
            icon: 'file:../../resources/icons/icon-mercadopago.svg',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["operation"]}}',
            description: 'Consume MercadoPago API',
            defaults: {
                name: 'MercadoPago',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'mercadoPagoApi',
                    required: true,
                },
                {
                    name: 'mercadoPagoSftp',
                    required: false,
                    displayOptions: {
                        show: {
                            resource: ['reporting'],
                            operation: [
                                'configureReleaseReport',
                                'editReleaseReportConfig',
                                'configureSettlementReport',
                                'editSettlementReport',
                            ],
                        },
                    },
                },
            ],
            properties: [
                // Selector de recurso (agrupador)
                {
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'options',
                    options: [
                        { name: 'Payments', value: 'payments', description: 'Payment Operations' },
                        { name: 'Reporting', value: 'reporting', description: 'Release Report operations' },
                    ],
                    default: 'payments',
                },
                // Selector de operación (Payments)
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    displayOptions: { show: { resource: ['payments'] } },
                    options: [
                        { name: 'Create Payment Link', value: 'createPaymentLink', description: 'Create a payment link (preference)' },
                    ],
                    default: 'createPaymentLink',
                    noDataExpression: true,
                },
                // Selector de operación (Reporting)
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    displayOptions: { show: { resource: ['reporting'] } },
                    options: [
                        { name: 'List Release Reports', value: 'listReleaseReports', description: 'List previously created release reports (Reporting API)' },
                        { name: 'List Settlement Reports', value: 'listSettlementReports', description: 'List previously created settlement reports (Reporting API)' },
                        { name: 'Configure Release Report', value: 'configureReleaseReport', description: 'Configure release report preferences (fields, frequency, delivery options)' },
                        { name: 'Configure Settlement Report', value: 'configureSettlementReport', description: 'Configure settlement report preferences (fields, frequency, delivery options)' },
                        { name: 'Edit Release Report Config', value: 'editReleaseReportConfig', description: 'Update existing release report preferences' },
                        { name: 'Edit Settlement Report Config', value: 'editSettlementReport', description: 'Update existing settlement report preferences' },
                        { name: 'Get Release Report Config', value: 'getReleaseReportConfig', description: 'Get current release report configuration for the account' },
                        { name: 'Get Settlement Report Config', value: 'getSettlementReportConfig', description: 'Get current settlement report configuration for the account' },
                        { name: 'Download Release Report', value: 'downloadReleaseReport', description: 'Download a generated release report file (CSV)' },
                        { name: 'Download Settlement Report', value: 'downloadSettlementReport', description: 'Download a generated settlement report file (CSV)' },
                    ],
                    default: 'listReleaseReports',
                    noDataExpression: true,
                },
                // ---- Props de createPaymentLink ----
                {
                    displayName: 'Items',
                    name: 'items',
                    type: 'fixedCollection',
                    typeOptions: {
                        multipleValues: true,
                    },
                    displayOptions: { show: { resource: ['payments'], operation: ['createPaymentLink'] } },
                    default: {},
                    placeholder: 'Add Item',
                    options: [
                        {
                            name: 'itemsValues',
                            displayName: 'Item',
                            values: [
                                { displayName: 'ID', name: 'id', type: 'string', default: '', description: 'Item ID' },
                                { displayName: 'Title', name: 'title', type: 'string', default: '', description: 'Item title', required: true },
                                { displayName: 'Description', name: 'description', type: 'string', default: '', description: 'Item description' },
                                { displayName: 'Picture URL', name: 'picture_url', type: 'string', default: '', description: 'Item image URL' },
                                { displayName: 'Category ID', name: 'category_id', type: 'string', default: '', description: 'Item category' },
                                { displayName: 'Quantity', name: 'quantity', type: 'number', default: 1, description: 'Item quantity', required: true },
                                { displayName: 'Currency ID', name: 'currency_id', type: 'string', default: '', description: 'Currency code (e.g. BRL, USD)', required: true },
                                { displayName: 'Unit Price', name: 'unit_price', type: 'number', default: 0, description: 'Item unit price', required: true },
                            ],
                        },
                    ],
                },
                {
                    displayName: 'Additional Fields',
                    name: 'additionalFields',
                    type: 'collection',
                    placeholder: 'Add Field',
                    default: {},
                    displayOptions: { show: { resource: ['payments'], operation: ['createPaymentLink'] } },
                    options: [
                        {
                            displayName: 'External Reference',
                            name: 'external_reference',
                            type: 'string',
                            default: '',
                            description: 'Max 64 chars. Allowed: letters (a-z, A-Z), numbers (0-9), hyphen (-), underscore (_).',
                        },
                        {
                            displayName: 'Notification URL',
                            name: 'notification_url',
                            type: 'string',
                            default: '',
                            description: "HTTPS only. Where you'll receive payment status notifications.",
                        },
                        { displayName: 'Binary Mode', name: 'binary_mode', type: 'boolean', default: false },
                        {
                            displayName: 'Statement Descriptor',
                            name: 'statement_descriptor',
                            type: 'string',
                            default: '',
                            description: 'Max 13 chars.',
                        },
                        {
                            displayName: 'Expiration Date From',
                            name: 'expiration_date_from',
                            type: 'string',
                            default: '',
                            description: "ISO with TZ: yyyy-MM-dd'T'HH:mm:ss(.SSS)(Z|±HH:mm)",
                        },
                        {
                            displayName: 'Expiration Date To',
                            name: 'expiration_date_to',
                            type: 'string',
                            default: '',
                            description: "ISO with TZ: yyyy-MM-dd'T'HH:mm:ss(.SSS)(Z|±HH:mm)",
                        },
                        {
                            displayName: 'Auto Return',
                            name: 'auto_return',
                            type: 'options',
                            options: [
                                { name: 'Disabled', value: 'none' },
                                { name: 'Approved', value: 'approved' },
                                { name: 'All', value: 'all' },
                            ],
                            default: 'none',
                            description: 'Requires Back URLs → Success when Approved/All.',
                        },
                        {
                            displayName: 'Back URLs',
                            name: 'back_urls',
                            type: 'fixedCollection',
                            typeOptions: {
                                multipleValues: false,
                            },
                            default: {},
                            options: [
                                {
                                    name: 'backUrlsValues',
                                    displayName: 'URLs',
                                    values: [
                                        { displayName: 'Success URL', name: 'success', type: 'string', default: '' },
                                        { displayName: 'Pending URL', name: 'pending', type: 'string', default: '' },
                                        { displayName: 'Failure URL', name: 'failure', type: 'string', default: '' },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    displayName: 'Columns (Settlement)',
                    name: 'columns',
                    type: 'fixedCollection',
                    typeOptions: { multipleValues: true },
                    default: {},
                    displayOptions: { show: { resource: ['reporting'], operation: ['configureSettlementReport', 'editSettlementReport'] } },
                    placeholder: 'Add Column',
                    options: [
                        {
                            name: 'columnsValues',
                            displayName: 'Column',
                            values: [
                                {
                                    displayName: 'Key',
                                    name: 'keySource',
                                    type: 'options',
                                    options: [
                                        { name: 'EXTERNAL_REFERENCE', value: 'EXTERNAL_REFERENCE' },
                                        { name: 'SOURCE_ID', value: 'SOURCE_ID' },
                                        { name: 'USER_ID', value: 'USER_ID' },
                                        { name: 'PAYMENT_METHOD', value: 'PAYMENT_METHOD' },
                                        { name: 'PAYMENT_METHOD_TYPE', value: 'PAYMENT_METHOD_TYPE' },
                                        { name: 'SITE', value: 'SITE' },
                                        { name: 'TRANSACTION_TYPE', value: 'TRANSACTION_TYPE' },
                                        { name: 'TRANSACTION_AMOUNT', value: 'TRANSACTION_AMOUNT' },
                                        { name: 'TRANSACTION_CURRENCY', value: 'TRANSACTION_CURRENCY' },
                                        { name: 'SELLER_AMOUNT', value: 'SELLER_AMOUNT' },
                                        { name: 'TRANSACTION_DATE', value: 'TRANSACTION_DATE' },
                                        { name: 'FEE_AMOUNT', value: 'FEE_AMOUNT' },
                                        { name: 'SETTLEMENT_NET_AMOUNT', value: 'SETTLEMENT_NET_AMOUNT' },
                                        { name: 'SETTLEMENT_CURRENCY', value: 'SETTLEMENT_CURRENCY' },
                                        { name: 'SETTLEMENT_DATE', value: 'SETTLEMENT_DATE' },
                                        { name: 'REAL_AMOUNT', value: 'REAL_AMOUNT' },
                                        { name: 'COUPON_AMOUNT', value: 'COUPON_AMOUNT' },
                                        { name: 'METADATA', value: 'METADATA' },
                                        { name: 'MKP_FEE_AMOUNT', value: 'MKP_FEE_AMOUNT' },
                                        { name: 'FINANCING_FEE_AMOUNT', value: 'FINANCING_FEE_AMOUNT' },
                                        { name: 'SHIPPING_FEE_AMOUNT', value: 'SHIPPING_FEE_AMOUNT' },
                                        { name: 'TAXES_AMOUNT', value: 'TAXES_AMOUNT' },
                                        { name: 'INSTALLMENTS', value: 'INSTALLMENTS' },
                                        { name: 'TAX_DETAIL', value: 'TAX_DETAIL' },
                                        { name: 'POS_ID', value: 'POS_ID' },
                                        { name: 'POS_NAME', value: 'POS_NAME' },
                                        { name: 'EXTERNAL_POS_ID', value: 'EXTERNAL_POS_ID' },
                                        { name: 'STORE_ID', value: 'STORE_ID' },
                                        { name: 'STORE_NAME', value: 'STORE_NAME' },
                                        { name: 'EXTERNAL_STORE_ID', value: 'EXTERNAL_STORE_ID' },
                                        { name: 'ORDER_ID', value: 'ORDER_ID' },
                                        { name: 'SHIPPING_ID', value: 'SHIPPING_ID' },
                                        { name: 'SHIPMENT_MODE', value: 'SHIPMENT_MODE' },
                                        { name: 'PACK_ID', value: 'PACK_ID' },
                                        { name: 'TAXES_DISAGGREGATED', value: 'TAXES_DISAGGREGATED' },
                                        { name: 'POI_ID', value: 'POI_ID' },
                                        { name: 'POI_WALLET_NAME', value: 'POI_WALLET_NAME' },
                                        { name: 'POI_BANK_NAME', value: 'POI_BANK_NAME' },
                                        { name: 'DESCRIPTION', value: 'DESCRIPTION' },
                                        { name: 'MONEY_RELEASE_DATE', value: 'MONEY_RELEASE_DATE' },
                                        { name: 'IS_RELEASED', value: 'IS_RELEASED' },
                                        { name: 'CARD_INITIAL_NUMBER', value: 'CARD_INITIAL_NUMBER' },
                                        { name: 'OPERATION_TAGS', value: 'OPERATION_TAGS' },
                                        { name: 'PAYER_NAME', value: 'PAYER_NAME' },
                                        { name: 'PAYER_ID_TYPE', value: 'PAYER_ID_TYPE' },
                                        { name: 'PAYER_ID_NUMBER', value: 'PAYER_ID_NUMBER' },
                                        { name: 'BUSINESS_UNIT', value: 'BUSINESS_UNIT' },
                                        { name: 'SUB_UNIT', value: 'SUB_UNIT' },
                                        { name: 'PRODUCT_SKU', value: 'PRODUCT_SKU' },
                                        { name: 'SALE_DETAIL', value: 'SALE_DETAIL' },
                                        { name: 'TIP_AMOUNT', value: 'TIP_AMOUNT' },
                                        { name: 'Custom...', value: 'custom' },
                                    ],
                                    default: 'EXTERNAL_REFERENCE',
                                    required: true,
                                },
                                {
                                    displayName: 'Custom Key',
                                    name: 'custom_key',
                                    type: 'string',
                                    default: '',
                                    displayOptions: { show: { keySource: ['custom'] } },
                                    description: 'Enter a custom key if not listed above',
                                },
                            ],
                        },
                    ],
                },
                // ---- Props de listReleaseReports ----
                {
                    displayName: 'Return All',
                    name: 'returnAll',
                    type: 'boolean',
                    default: true,
                    displayOptions: { show: { resource: ['reporting'], operation: ['listReleaseReports', 'listSettlementReports'] } },
                },
                {
                    displayName: 'Limit',
                    name: 'limit',
                    type: 'number',
                    typeOptions: { minValue: 1, maxValue: 1000 },
                    default: 100,
                    displayOptions: { show: { resource: ['reporting'], operation: ['listReleaseReports', 'listSettlementReports'], returnAll: [false] } },
                },
                {
                    displayName: 'Filters',
                    name: 'reportFilters',
                    type: 'collection',
                    default: {},
                    displayOptions: { show: { resource: ['reporting'], operation: ['listReleaseReports', 'listSettlementReports'] } },
                    placeholder: 'Add Filter',
                    options: [
                        { displayName: 'Offset', name: 'offset', type: 'number', typeOptions: { minValue: 0 }, default: 0 },
                        { displayName: 'Limit (API Page Size)', name: 'apiLimit', type: 'number', typeOptions: { minValue: 1, maxValue: 1000 }, default: 200 },
                    ],
                },
                // ---- Props de configureReleaseReport ----
                {
                    displayName: 'Columns',
                    name: 'columns',
                    type: 'fixedCollection',
                    typeOptions: { multipleValues: true },
                    default: {},
                    displayOptions: { show: { resource: ['reporting'], operation: ['configureReleaseReport', 'editReleaseReportConfig'] } },
                    placeholder: 'Add Column',
                    options: [
                        {
                            name: 'columnsValues',
                            displayName: 'Column',
                            values: [
                                {
                                    displayName: 'Key',
                                    name: 'keySource',
                                    type: 'options',
                                    options: [
                                        { name: 'DATE', value: 'DATE' },
                                        { name: 'SOURCE_ID', value: 'SOURCE_ID' },
                                        { name: 'EXTERNAL_REFERENCE', value: 'EXTERNAL_REFERENCE' },
                                        { name: 'RECORD_TYPE', value: 'RECORD_TYPE' },
                                        { name: 'DESCRIPTION', value: 'DESCRIPTION' },
                                        { name: 'NET_CREDIT_AMOUNT', value: 'NET_CREDIT_AMOUNT' },
                                        { name: 'NET_DEBIT_AMOUNT', value: 'NET_DEBIT_AMOUNT' },
                                        { name: 'SELLER_AMOUNT', value: 'SELLER_AMOUNT' },
                                        { name: 'GROSS_AMOUNT', value: 'GROSS_AMOUNT' },
                                        { name: 'METADATA', value: 'METADATA' },
                                        { name: 'MP_FEE_AMOUNT', value: 'MP_FEE_AMOUNT' },
                                        { name: 'FINANCING_FEE_AMOUNT', value: 'FINANCING_FEE_AMOUNT' },
                                        { name: 'SHIPPING_FEE_AMOUNT', value: 'SHIPPING_FEE_AMOUNT' },
                                        { name: 'TAXES_AMOUNT', value: 'TAXES_AMOUNT' },
                                        { name: 'COUPON_AMOUNT', value: 'COUPON_AMOUNT' },
                                        { name: 'INSTALLMENTS', value: 'INSTALLMENTS' },
                                        { name: 'PAYMENT_METHOD', value: 'PAYMENT_METHOD' },
                                        { name: 'PAYMENT_METHOD_TYPE', value: 'PAYMENT_METHOD_TYPE' },
                                        { name: 'TAX_DETAIL', value: 'TAX_DETAIL' },
                                        { name: 'TAX_AMOUNT_TELCO', value: 'TAX_AMOUNT_TELCO' },
                                        { name: 'TRANSACTION_APPROVAL_DATE', value: 'TRANSACTION_APPROVAL_DATE' },
                                        { name: 'POS_ID', value: 'POS_ID' },
                                        { name: 'POS_NAME', value: 'POS_NAME' },
                                        { name: 'EXTERNAL_POS_ID', value: 'EXTERNAL_POS_ID' },
                                        { name: 'STORE_ID', value: 'STORE_ID' },
                                        { name: 'STORE_NAME', value: 'STORE_NAME' },
                                        { name: 'EXTERNAL_STORE_ID', value: 'EXTERNAL_STORE_ID' },
                                        { name: 'ORDER_ID', value: 'ORDER_ID' },
                                        { name: 'SHIPPING_ID', value: 'SHIPPING_ID' },
                                        { name: 'SHIPMENT_MODE', value: 'SHIPMENT_MODE' },
                                        { name: 'PACK_ID', value: 'PACK_ID' },
                                        { name: 'TAXES_DISAGGREGATED', value: 'TAXES_DISAGGREGATED' },
                                        { name: 'EFFECTIVE_COUPON_AMOUNT', value: 'EFFECTIVE_COUPON_AMOUNT' },
                                        { name: 'POI_ID', value: 'POI_ID' },
                                        { name: 'CARD_INITIAL_NUMBER', value: 'CARD_INITIAL_NUMBER' },
                                        { name: 'OPERATION_TAGS', value: 'OPERATION_TAGS' },
                                        { name: 'ITEM_ID', value: 'ITEM_ID' },
                                        { name: 'BALANCE_AMOUNT', value: 'BALANCE_AMOUNT' },
                                        { name: 'PAYOUT_BANK_ACCOUNT_NUMBER', value: 'PAYOUT_BANK_ACCOUNT_NUMBER' },
                                        { name: 'PRODUCT_SKU', value: 'PRODUCT_SKU' },
                                        { name: 'SALE_DETAIL', value: 'SALE_DETAIL' },
                                        { name: 'Custom...', value: 'custom' },
                                    ],
                                    default: 'DATE',
                                    required: true,
                                },
                                {
                                    displayName: 'Custom Key',
                                    name: 'custom_key',
                                    type: 'string',
                                    default: '',
                                    displayOptions: { show: { keySource: ['custom'] } },
                                    description: 'Enter a custom key if not listed above',
                                },
                            ],
                        },
                    ],
                },
                {
                    displayName: 'File Name Prefix',
                    name: 'file_name_prefix',
                    type: 'string',
                    default: '',
                    displayOptions: { show: { operation: ['configureReleaseReport', 'editReleaseReportConfig', 'configureSettlementReport', 'editSettlementReport'] } },
                    description: 'Prefix for the generated report file name',
                    required: true,
                },
                {
                    displayName: 'Frequency',
                    name: 'frequency',
                    type: 'fixedCollection',
                    typeOptions: { multipleValues: false },
                    default: {},
                    displayOptions: { show: { operation: ['configureReleaseReport', 'editReleaseReportConfig', 'configureSettlementReport', 'editSettlementReport'] } },
                    options: [
                        {
                            name: 'frequencyValues',
                            displayName: 'Frequency',
                            values: [
                                { displayName: 'Hour (0-23)', name: 'hour', type: 'number', default: 0, typeOptions: { minValue: 0, maxValue: 23 }, required: true },
                                { displayName: 'Value (positive)', name: 'value', type: 'number', default: 1, typeOptions: { minValue: 1 }, required: true },
                                { displayName: 'Type', name: 'type', type: 'options', options: [
                                        { name: 'Daily', value: 'daily' },
                                        { name: 'Weekly', value: 'weekly' },
                                        { name: 'Monthly', value: 'monthly' },
                                    ], default: 'monthly', required: true },
                            ],
                        },
                    ],
                },
                {
                    displayName: 'Additional Fields',
                    name: 'configAdditionalFields',
                    type: 'collection',
                    placeholder: 'Add Field',
                    default: {},
                    displayOptions: { show: { operation: ['configureReleaseReport', 'editReleaseReportConfig'] } },
                    options: [
                        { displayName: 'Separator', name: 'separator', type: 'string', default: '' },
                        { displayName: 'Display Timezone', name: 'display_timezone', type: 'string', default: 'GMT-04' },
                        { displayName: 'Report Translation', name: 'report_translation', type: 'string', default: 'es' },
                        {
                            displayName: 'Notification Email List',
                            name: 'notification_email_list',
                            type: 'fixedCollection',
                            typeOptions: { multipleValues: true },
                            default: {},
                            options: [
                                {
                                    name: 'emails',
                                    displayName: 'Email',
                                    values: [
                                        { displayName: 'Value', name: 'value', type: 'string', default: '' },
                                    ],
                                },
                            ],
                        },
                        { displayName: 'Include Withdrawal At End', name: 'include_withdrawal_at_end', type: 'boolean', default: false },
                        { displayName: 'Check Available Balance', name: 'check_available_balance', type: 'boolean', default: false },
                        { displayName: 'Compensate Detail', name: 'compensate_detail', type: 'boolean', default: false },
                        { displayName: 'Execute After Withdrawal', name: 'execute_after_withdrawal', type: 'boolean', default: false },
                        { displayName: 'Scheduled', name: 'scheduled', type: 'boolean', default: false },
                    ],
                },
                {
                    displayName: 'Additional Fields (Settlement)',
                    name: 'settlementAdditionalFields',
                    type: 'collection',
                    placeholder: 'Add Field',
                    default: {},
                    displayOptions: { show: { operation: ['configureSettlementReport', 'editSettlementReport'] } },
                    options: [
                        { displayName: 'Separator', name: 'separator', type: 'string', default: '' },
                        { displayName: 'Display Timezone', name: 'display_timezone', type: 'string', default: 'GMT-04' },
                        { displayName: 'Report Translation', name: 'report_translation', type: 'string', default: 'es' },
                        {
                            displayName: 'Notification Email List',
                            name: 'notification_email_list',
                            type: 'fixedCollection',
                            typeOptions: { multipleValues: true },
                            default: {},
                            options: [
                                {
                                    name: 'emails',
                                    displayName: 'Email',
                                    values: [
                                        { displayName: 'Value', name: 'value', type: 'string', default: '' },
                                    ],
                                },
                            ],
                        },
                        { displayName: 'Scheduled', name: 'scheduled', type: 'boolean', default: false },
                    ],
                },
                // ---- Props de downloadReleaseReport ----
                {
                    displayName: 'File Name',
                    name: 'file_name',
                    type: 'string',
                    default: '',
                    displayOptions: { show: { resource: ['reporting'], operation: ['downloadReleaseReport', 'downloadSettlementReport'] } },
                    description: 'File name to download, e.g. report_2024-09.csv',
                    required: true,
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const opRaw = this.getNodeParameter('operation', 0);
        const op = (0, operations_1.isOperationName)(opRaw) ? opRaw : undefined;
        // Carga credenciales una vez
        const credentials = (await this.getCredentials('mercadoPagoApi'));
        // Load optional SFTP credentials (not configured = undefined, expected)
        let sftpCredentials;
        try {
            sftpCredentials = (await this.getCredentials('mercadoPagoSftp'));
        }
        catch {
            sftpCredentials = undefined;
        }
        const makeRequest = async (init) => {
            const DEFAULT_TIMEOUT_MS = 60000;
            const MAX_RETRIES = 2;
            const isJson = init.json !== undefined ? init.json : true;
            const options = {
                method: init.method,
                url: init.url,
                qs: init.qs,
                body: init.body,
                form: init.form,
                json: isJson,
                timeout: (init.timeoutMs ?? DEFAULT_TIMEOUT_MS),
                headers: {
                    ...(isJson ? { 'Content-Type': 'application/json' } : {}),
                    Authorization: `Bearer ${credentials.accessToken}`,
                    'X-Platform-Id': constants_1.HTTP_HEADERS.X_PLATFORM_ID,
                    ...(init.headers ?? {}),
                },
            };
            const sleep = async (ms) => await new Promise((resolve) => setTimeout(resolve, ms));
            let attempt = 0;
            while (true) {
                try {
                    return (await this.helpers.request(options));
                }
                catch (error) {
                    const err = error;
                    const status = err?.statusCode ?? err?.response?.status;
                    const isRetryable = status === 429 || (status !== undefined && status >= 500 && status < 600);
                    if (!isRetryable || attempt >= MAX_RETRIES) {
                        // Parse MercadoPago API error response for a clearer message
                        let mpMessage = '';
                        try {
                            const rawBody = err?.response?.body ?? err?.body;
                            if (typeof rawBody === 'string') {
                                const parsed = JSON.parse(rawBody);
                                const parts = [];
                                if (parsed.error)
                                    parts.push(parsed.error);
                                if (parsed.message)
                                    parts.push(parsed.message);
                                if (Array.isArray(parsed.cause) && parsed.cause.length) {
                                    parts.push(`Causes: ${parsed.cause.map((c) => (typeof c === 'string' ? c : JSON.stringify(c))).join(', ')}`);
                                }
                                mpMessage = parts.join(' - ');
                            }
                        }
                        catch {
                            // If body parsing fails, use original error
                        }
                        if (mpMessage) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), `MercadoPago API error (${status ?? 'unknown'}): ${mpMessage}`, { description: error.message });
                        }
                        throw error;
                    }
                    attempt++;
                    const retryAfterRaw = err?.response?.headers?.['retry-after'] ?? err?.headers?.['retry-after'];
                    const retryAfterSeconds = typeof retryAfterRaw === 'string' ? Number(retryAfterRaw) : NaN;
                    const waitMs = Number.isFinite(retryAfterSeconds)
                        ? Math.max(0, retryAfterSeconds * 1000)
                        : 1000 * attempt;
                    await sleep(waitMs);
                }
            }
        };
        const makeCtx = (i) => ({
            i,
            get: (name, def) => this.getNodeParameter(name, i, def),
            credentials,
            sftpCredentials,
            helpers: this.helpers,
            nodeError: (msg) => {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), msg, { itemIndex: i });
            },
            request: makeRequest,
        });
        for (let i = 0; i < items.length; i++) {
            try {
                if (!op) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Unsupported operation: ${opRaw}`, { itemIndex: i });
                }
                const handler = operations_1.operations[op];
                if (!handler) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Unsupported operation: ${op}`, { itemIndex: i });
                }
                // Usa exactamente la misma firma que HandlerCtx para evitar incompatibilidades de tipos
                const ctx = makeCtx(i);
                const res = await handler(ctx);
                const execData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(Array.isArray(res) ? res : [res]), { itemData: { item: i } });
                returnData.push(...execData);
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message } });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.MercadoPago = MercadoPago;
//# sourceMappingURL=MercadoPago.node.js.map