import {
	IExecuteFunctions,
	type ILoadOptionsFunctions,
	INodeExecutionData,
	type INodeListSearchResult,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
	type IHttpRequestOptions,
	type JsonObject,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';

import { HTTP_HEADERS } from '../../constants';

import { operations, isOperationName, type HandlerCtx, type MercadoPagoCredentials, type SftpCredentials, type OperationName, type RequestInit } from './operations';

/**
 * Fetch the list of generated report files from the given list endpoint.
 * Used by the Resource Locator's "From List" mode.
 */
async function fetchReportFiles(
	this: ILoadOptionsFunctions,
	url: string,
): Promise<INodeListSearchResult> {
	const response = (await this.helpers.httpRequestWithAuthentication.call(
		this,
		'mercadoPagoApi',
		{
			method: 'GET',
			url,
			headers: {
				'X-Platform-Id': HTTP_HEADERS.X_PLATFORM_ID,
			},
		},
	)) as { results?: Array<{ file_name?: string }> } | Array<{ file_name?: string }>;

	const list = Array.isArray(response) ? response : (response.results ?? []);
	const results = list
		.map((item) => item?.file_name)
		.filter((name): name is string => typeof name === 'string' && name.length > 0)
		.map((name) => ({ name, value: name }));

	return { results };
}

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
export class MercadoPago implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'MercadoPago',
		name: 'mercadoPago',
		icon: { light: 'file:icon-mercadopago.svg', dark: 'file:icon-mercadopago.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Consume MercadoPago API',
		defaults: {
			name: 'MercadoPago',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
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
							'createOrUpdateReleaseReportConfig',
							
							'createOrUpdateSettlementReportConfig',
							
						],
					},
				},
			},
		],
		properties: [
			// Resource selector (grouping)
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{ name: 'Payment', value: 'payments', description: 'Create payment links and manage checkout preferences' },
					{ name: 'Reporting', value: 'reporting', description: 'Release Report operations' },
				],
				default: 'payments',
			},
			// Operation selector (Payments)
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
			// Operation selector (Reporting)
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: { show: { resource: ['reporting'] } },
				options: [
					{ name: 'Get Many Release Reports', value: 'getManyReleaseReports', description: 'Retrieve a list of generated release reports' },
					{ name: 'Get Many Settlement Reports', value: 'getManySettlementReports', description: 'Retrieve a list of generated settlement reports' },
					{ name: 'Create or Update Release Report Config', value: 'createOrUpdateReleaseReportConfig', description: 'Create a new release report configuration or update an existing one (upsert)' },
					{ name: 'Create or Update Settlement Report Config', value: 'createOrUpdateSettlementReportConfig', description: 'Create a new settlement report configuration or update an existing one (upsert)' },
					{ name: 'Get Release Report Config', value: 'getReleaseReportConfig', description: 'Retrieve the current release report configuration for the account' },
					{ name: 'Get Settlement Report Config', value: 'getSettlementReportConfig', description: 'Retrieve the current settlement report configuration for the account' },
					{ name: 'Download Release Report', value: 'downloadReleaseReport', description: 'Download a generated release report file as CSV' },
					{ name: 'Download Settlement Report', value: 'downloadSettlementReport', description: 'Download a generated settlement report file as CSV' },
				],
				default: 'getManyReleaseReports',
				noDataExpression: true,
			},

			// ---- createPaymentLink properties ----
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
							{ displayName: 'ID', name: 'id', type: 'string', default: '', placeholder: 'e.g. SKU-12345', description: 'Item ID' },
							{ displayName: 'Title', name: 'title', type: 'string', default: '', placeholder: 'e.g. T-Shirt', description: 'Item title', required: true },
							{ displayName: 'Description', name: 'description', type: 'string', default: '', placeholder: 'e.g. Premium cotton t-shirt', description: 'Item description' },
							{ displayName: 'Picture URL', name: 'picture_url', type: 'string', default: '', placeholder: 'e.g. https://example.com/image.png', description: 'Item image URL' },
							{ displayName: 'Category ID', name: 'category_id', type: 'string', default: '', placeholder: 'e.g. retail', description: 'Item category' },
							{ displayName: 'Quantity', name: 'quantity', type: 'number', typeOptions: { minValue: 1 }, default: 1, description: 'Item quantity (must be ≥ 1)', required: true },
							{ displayName: 'Currency ID', name: 'currency_id', type: 'string', default: '', placeholder: 'e.g. ARS', description: 'Currency code (e.g. BRL, USD, ARS)' },
							{ displayName: 'Unit Price', name: 'unit_price', type: 'number', default: 1, description: 'Unit price — must be greater than 0. Use integer values for currencies that do not support decimals (e.g. CLP)', required: true },
						],
					},
				],
			},
			{
				displayName: 'Simplify',
				name: 'simplify',
				type: 'boolean',
				default: true,
				displayOptions: { show: { resource: ['payments'], operation: ['createPaymentLink'] } },
				description: 'Whether to return a simplified version of the response instead of the raw data',
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
						placeholder: 'e.g. order-12345',
						description:
							'Maximum 64 characters. Allowed: letters (a-z, A-Z), numbers (0-9), hyphen (-), underscore (_).',
					},
					{
						displayName: 'Notification URL',
						name: 'notification_url',
						type: 'string',
						default: '',
						placeholder: 'e.g. https://example.com/webhook',
						description: "HTTPS only. Where you'll receive payment status notifications.",
					},
					{ displayName: 'Binary Mode', name: 'binary_mode', type: 'boolean', default: false, description: 'Whether to require an explicit approved or rejected response (no pending state)' },
					{
						displayName: 'Statement Descriptor',
						name: 'statement_descriptor',
						type: 'string',
						default: '',
						placeholder: 'e.g. MYCOMPANY',
						description: 'Maximum 13 characters. Shown on the buyer\'s credit card statement.',
					},
					{
						displayName: 'Expiration Date From',
						name: 'expiration_date_from',
						type: 'string',
						default: '',
						placeholder: 'e.g. 2024-12-31T23:59:59-03:00',
						description: "ISO 8601 format with timezone (yyyy-MM-dd'T'HH:mm:ss(.SSS)(Z|±HH:mm))",
					},
					{
						displayName: 'Expiration Date To',
						name: 'expiration_date_to',
						type: 'string',
						default: '',
						placeholder: 'e.g. 2024-12-31T23:59:59-03:00',
						description: "ISO 8601 format with timezone (yyyy-MM-dd'T'HH:mm:ss(.SSS)(Z|±HH:mm))",
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
						description: "Requires 'Back URLs → Success' when 'Approved' or 'All' is selected.",
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
									{ displayName: 'Success URL', name: 'success', type: 'string', default: '', placeholder: 'e.g. https://example.com/success', description: 'URL to redirect to after a successful payment' },
									{ displayName: 'Pending URL', name: 'pending', type: 'string', default: '', placeholder: 'e.g. https://example.com/pending', description: 'URL to redirect to after a pending payment' },
									{ displayName: 'Failure URL', name: 'failure', type: 'string', default: '', placeholder: 'e.g. https://example.com/failed', description: 'URL to redirect to when a payment is rejected' },
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
				displayOptions: { show: { resource: ['reporting'], operation: ['createOrUpdateSettlementReportConfig'] } },
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
								placeholder: 'e.g. CUSTOM_COLUMN',
								displayOptions: { show: { keySource: ['custom'] } },
								description: 'Enter a custom key if not listed above',
							},
						],
					},
				],
			},

			// ---- listReleaseReports properties ----
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				description: 'Whether to return all results or only up to a given limit',
				default: true,
				displayOptions: { show: { resource: ['reporting'], operation: ['getManyReleaseReports', 'getManySettlementReports'] } },
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 1000 },
				default: 100,
				displayOptions: { show: { resource: ['reporting'], operation: ['getManyReleaseReports', 'getManySettlementReports'], returnAll: [false] } },
			},
			{
				displayName: 'Filters',
				name: 'reportFilters',
				type: 'collection',
				default: {},
				displayOptions: { show: { resource: ['reporting'], operation: ['getManyReleaseReports', 'getManySettlementReports'] } },
				placeholder: 'Add Filter',
				options: [
					{ displayName: 'Offset', name: 'offset', type: 'number', typeOptions: { minValue: 0 }, default: 0 },
					{ displayName: 'Limit (API Page Size)', name: 'apiLimit', type: 'number', typeOptions: { minValue: 1, maxValue: 1000 }, default: 200 },
				],
			},

			// ---- Report configuration properties ----
			{
				displayName: 'Columns',
				name: 'columns',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				default: {},
				displayOptions: { show: { resource: ['reporting'], operation: ['createOrUpdateReleaseReportConfig'] } },
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
								placeholder: 'e.g. CUSTOM_COLUMN',
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
				placeholder: 'e.g. monthly-',
				displayOptions: { show: { operation: ['createOrUpdateReleaseReportConfig',  'createOrUpdateSettlementReportConfig'] } },
				description: 'Prefix added to each generated report file name',
				required: true,
			},
			{
				displayName: 'Frequency',
				name: 'frequency',
				type: 'fixedCollection',
				typeOptions: { multipleValues: false },
				default: {},
				displayOptions: { show: { operation: ['createOrUpdateReleaseReportConfig',  'createOrUpdateSettlementReportConfig'] } },
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
				displayOptions: { show: { operation: ['createOrUpdateReleaseReportConfig'] } },
				options: [
					{ displayName: 'Separator', name: 'separator', type: 'string', default: '', placeholder: 'e.g. ,', description: 'Character used to separate columns in the CSV file' },
					{ displayName: 'Display Timezone', name: 'display_timezone', type: 'string', default: 'GMT-04', placeholder: 'e.g. GMT-04', description: 'Timezone used for date and time fields in the report' },
					{ displayName: 'Report Translation', name: 'report_translation', type: 'string', default: 'es', placeholder: 'e.g. es', description: "Language code used for report labels (e.g. 'es', 'en', 'pt')" },
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
									{ displayName: 'Email', name: 'value', type: 'string', default: '', placeholder: 'e.g. finance@example.com', description: 'Email address to notify when reports are generated' },
								],
							},
						],
					},
					{ displayName: 'Include Withdrawal At End', name: 'include_withdrawal_at_end', type: 'boolean', default: false, description: 'Whether to include withdrawals at the end of the report' },
					{ displayName: 'Check Available Balance', name: 'check_available_balance', type: 'boolean', default: false, description: 'Whether to validate available balance against transactions in the report' },
					{ displayName: 'Compensate Detail', name: 'compensate_detail', type: 'boolean', default: false, description: 'Whether to add compensation details to the report rows' },
					{ displayName: 'Execute After Withdrawal', name: 'execute_after_withdrawal', type: 'boolean', default: false, description: 'Whether to generate the report only after a withdrawal occurs' },
					{ displayName: 'Scheduled', name: 'scheduled', type: 'boolean', default: false, description: 'Whether to schedule the report for periodic automatic generation' },
				],
			},
			{
				displayName: 'Additional Fields (Settlement)',
				name: 'settlementAdditionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { operation: ['createOrUpdateSettlementReportConfig'] } },
				options: [
					{ displayName: 'Separator', name: 'separator', type: 'string', default: '', placeholder: 'e.g. ,', description: 'Character used to separate columns in the CSV file' },
					{ displayName: 'Display Timezone', name: 'display_timezone', type: 'string', default: 'GMT-04', placeholder: 'e.g. GMT-04', description: 'Timezone used for date and time fields in the report' },
					{ displayName: 'Report Translation', name: 'report_translation', type: 'string', default: 'es', placeholder: 'e.g. es', description: "Language code used for report labels (e.g. 'es', 'en', 'pt')" },
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
									{ displayName: 'Email', name: 'value', type: 'string', default: '', placeholder: 'e.g. finance@example.com', description: 'Email address to notify when reports are generated' },
								],
							},
						],
					},
					{ displayName: 'Scheduled', name: 'scheduled', type: 'boolean', default: false, description: 'Whether to schedule the report for periodic automatic generation' },
				],
			},

			// ---- Download properties ----
			{
				displayName: 'File',
				name: 'file_name',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				displayOptions: { show: { resource: ['reporting'], operation: ['downloadReleaseReport'] } },
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'getReleaseReportFiles',
							searchable: true,
						},
					},
					{
						displayName: 'By Name',
						name: 'name',
						type: 'string',
						placeholder: 'e.g. release-report-202409.csv',
					},
				],
				description: 'Release report file to download',
			},
			{
				displayName: 'File',
				name: 'file_name',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				displayOptions: { show: { resource: ['reporting'], operation: ['downloadSettlementReport'] } },
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'getSettlementReportFiles',
							searchable: true,
						},
					},
					{
						displayName: 'By Name',
						name: 'name',
						type: 'string',
						placeholder: 'e.g. settlement-report-202409.csv',
					},
				],
				description: 'Settlement report file to download',
			},
		],
	};

	methods = {
		listSearch: {
			async getReleaseReportFiles(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
				return await fetchReportFiles.call(this, 'https://api.mercadopago.com/v1/account/release_report/list');
			},
			async getSettlementReportFiles(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
				return await fetchReportFiles.call(this, 'https://api.mercadopago.com/v1/account/settlement_report/list');
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const opRaw = this.getNodeParameter('operation', 0) as string;
		const op: OperationName | undefined = isOperationName(opRaw) ? opRaw : undefined;

		// Load credentials once
		const credentials = (await this.getCredentials('mercadoPagoApi')) as MercadoPagoCredentials;

		// Load optional SFTP credentials (not configured = undefined, expected)
		let sftpCredentials: SftpCredentials | undefined;
		try {
			sftpCredentials = (await this.getCredentials('mercadoPagoSftp')) as unknown as SftpCredentials;
		} catch {
			sftpCredentials = undefined;
		}

		const makeRequest = async <TResponse = unknown>(init: RequestInit): Promise<TResponse> => {
			const DEFAULT_TIMEOUT_MS = 60_000;
			const isJson = init.json !== undefined ? init.json : true;
			const options: IHttpRequestOptions = {
				method: init.method,
				url: init.url,
				qs: init.qs as IHttpRequestOptions['qs'],
				body: init.body as IHttpRequestOptions['body'],
				json: isJson,
				timeout: init.timeoutMs ?? DEFAULT_TIMEOUT_MS,
				headers: {
					...(isJson ? { 'Content-Type': 'application/json' } : {}),
					'X-Platform-Id': HTTP_HEADERS.X_PLATFORM_ID,
					...(init.headers ?? {}),
				},
			};

			return (await this.helpers.httpRequestWithAuthentication.call(
				this,
				'mercadoPagoApi',
				options,
			)) as TResponse;
		};

		const makeCtx = (i: number): HandlerCtx => ({
			i,
			get: <T = unknown>(name: string, def?: T) => this.getNodeParameter(name, i, def) as T,
			credentials,
			sftpCredentials,
			helpers: this.helpers,
			nodeError: (msg: string) => {
				throw new NodeOperationError(this.getNode(), msg, { itemIndex: i });
			},
			apiError: (error: unknown, options?: { message?: string; description?: string }) => {
				throw new NodeApiError(this.getNode(), error as JsonObject, {
					itemIndex: i,
					...(options ?? {}),
				});
			},
			request: makeRequest,
		});

		for (let i = 0; i < items.length; i++) {
			try {
				if (!op) {
					throw new NodeOperationError(this.getNode(), `Unsupported operation: ${opRaw}`, { itemIndex: i });
				}
				const handler = operations[op];
				if (!handler) {
					throw new NodeOperationError(this.getNode(), `Unsupported operation: ${op}`, { itemIndex: i });
				}

				// Use the exact HandlerCtx signature to avoid type incompatibilities
				const ctx = makeCtx(i);

				const res = await handler(ctx);

				const execData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(Array.isArray(res) ? res : [res]),
					{ itemData: { item: i } },
				);
				returnData.push(...execData);
			} catch (error) {
				const wrapped = (error instanceof NodeOperationError || error instanceof NodeApiError)
					? error
					: new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (wrapped as Error).message } });
					continue;
				}
				throw wrapped;
			}
		}

		return [returnData];
	}
}
