import type { OperationHandler } from './index';
import { API_ENDPOINTS } from '../../../constants';

type ItemValue = {
	id?: string;
	title?: string;
	description?: string;
	picture_url?: string;
	category_id?: string;
	quantity?: number;
	currency_id?: string;
	unit_price?: number;
};

type ItemsParam = {
	itemsValues?: ItemValue[];
};

type BackUrlsValues = {
	success?: string;
	pending?: string;
	failure?: string;
};

type PaymentLinkAdditionalFields = {
	external_reference?: string;
	notification_url?: string;
	auto_return?: string;
	back_urls?: { backUrlsValues: BackUrlsValues };
	binary_mode?: boolean;
	statement_descriptor?: string;
	expiration_date_from?: string;
	expiration_date_to?: string;
};

type PreferenceItem = {
	id: string;
	title: string;
	description: string;
	picture_url: string;
	category_id: string;
	quantity: number;
	currency_id: string;
	unit_price: number;
};

type CreatePreferenceBody = {
	items: PreferenceItem[];
	external_reference?: string;
	notification_url?: string;
	binary_mode?: boolean;
	statement_descriptor?: string;
	expires?: boolean;
	expiration_date_from?: string;
	expiration_date_to?: string;
	auto_return?: string;
	back_urls?: BackUrlsValues;
};

/**
 * Create Checkout Preference (payment link).
 *
 * Validates and maps input parameters from the n8n node UI to the Mercado Pago
 * Checkout Preferences API payload, then performs a POST request to
 * `https://api.mercadopago.com/checkout/preferences`.
 *
 * Input fields are retrieved with `ctx.get(...)`:
 * - `items` (collection): product list with `title`, `quantity`, `currency_id`, `unit_price`, etc.
 * - `additionalFields` (collection): optional metadata like `external_reference`,
 *   `notification_url`, `auto_return`, `back_urls`, statement descriptor and expiration window.
 *
 * Important validations:
 * - `external_reference` must be <= 64 chars and use only [A-Za-z0-9_-].
 * - URLs must be HTTPS or a deeplink for back URLs. Notification URL must be HTTPS.
 * - `statement_descriptor` must be <= 13 chars.
 * - Expiration dates must be valid ISO with timezone and From <= To.
 *
 * Returns the created preference payload as provided by the API.
 */
const isHttps = (value: string) => /^https:\/\//i.test(value);
const disallowedSchemes = /^(?:http|ftp|file|mailto|ws|wss|data|blob):\/\//i;
const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i;
const isDeeplink = (value: string) => hasScheme.test(value) && !disallowedSchemes.test(value) && !isHttps(value);
const isAllowedRedirect = (value: string) => isHttps(value) || isDeeplink(value);
const isoTZRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/;

const handler: OperationHandler = async (ctx) => {
	// Items
	const itemsCollection = ctx.get<ItemsParam>('items');
	const itemsArr = itemsCollection?.itemsValues ?? [];

	// Additional fields
	const additionalFields = ctx.get<PaymentLinkAdditionalFields>('additionalFields', {});

	// External reference
	if (additionalFields.external_reference) {
		const extRef = additionalFields.external_reference.toString().trim();
		const allowed = /^[A-Za-z0-9_-]+$/;
		if (extRef.length > 64 || !allowed.test(extRef)) {
			ctx.nodeError('Invalid External Reference. Must be <= 64 chars and only letters, numbers, hyphen (-), underscore (_).');
		}
		additionalFields.external_reference = extRef;
	}

	// Auto return needs success URL
	const autoReturn = (additionalFields.auto_return || 'none') as string;
	const successUrl = additionalFields.back_urls?.backUrlsValues?.success;
	if (autoReturn === 'approved' || autoReturn === 'all') {
		if (!successUrl || !isAllowedRedirect(successUrl)) {
			ctx.nodeError('Back URLs → Success must be https:// or a deeplink (e.g. myapp://...). http is not allowed.');
		}
	}

	// Pending/Failure back URLs if provided
	const pendingUrl = additionalFields.back_urls?.backUrlsValues?.pending;
	const failureUrl = additionalFields.back_urls?.backUrlsValues?.failure;
	for (const [fieldName, fieldValue] of [
		['back_urls.pending', pendingUrl],
		['back_urls.failure', failureUrl],
	] as const) {
		if (fieldValue && !isAllowedRedirect(fieldValue)) {
			ctx.nodeError(`Back URL must be https:// or a deeplink scheme. Invalid field: ${fieldName}`);
		}
	}

	// Notification URL
	if (additionalFields.notification_url) {
		const notif = additionalFields.notification_url.toString().trim();
		if (notif.length > 248 || !isHttps(notif)) {
			ctx.nodeError('Notification URL must start with https:// and be at most 248 characters.');
		}
		additionalFields.notification_url = notif;
	}

	// Statement descriptor
	if (additionalFields.statement_descriptor) {
		const sd = additionalFields.statement_descriptor.toString().trim();
		if (sd.length > 13) ctx.nodeError('Statement Descriptor must be at most 13 characters.');
		additionalFields.statement_descriptor = sd;
	}

	// Expiration dates + ordering
	let expFrom: string | undefined;
	let expTo: string | undefined;
	if (additionalFields.expiration_date_from) {
		expFrom = additionalFields.expiration_date_from.toString().trim();
		if (!isoTZRegex.test(expFrom) || isNaN(new Date(expFrom).getTime())) {
			ctx.nodeError("Expiration Date From must match yyyy-MM-dd'T'HH:mm:ss(.SSS)(Z|±HH:mm).");
		}
		additionalFields.expiration_date_from = expFrom;
	}
	if (additionalFields.expiration_date_to) {
		expTo = additionalFields.expiration_date_to.toString().trim();
		if (!isoTZRegex.test(expTo) || isNaN(new Date(expTo).getTime())) {
			ctx.nodeError("Expiration Date To must match yyyy-MM-dd'T'HH:mm:ss(.SSS)(Z|±HH:mm).");
		}
		additionalFields.expiration_date_to = expTo;
	}
	if (expFrom && expTo && new Date(expFrom).getTime() > new Date(expTo).getTime()) {
		ctx.nodeError('Expiration Date From must be earlier than or equal to Expiration Date To.');
	}

	// Body
	const body: CreatePreferenceBody = {
		items: itemsArr.map((item) => ({
			id: (item.id ?? '').toString(),
			title: (item.title ?? '').toString(),
			description: (item.description ?? '').toString(),
			picture_url: (item.picture_url ?? '').toString(),
			category_id: (item.category_id ?? '').toString(),
			quantity: Number(item.quantity) || 0,
			currency_id: (item.currency_id ?? '').toString(),
			unit_price: Number(item.unit_price) || 0,
		})),
	};

	if (additionalFields.external_reference) body.external_reference = additionalFields.external_reference;
	if (additionalFields.notification_url) body.notification_url = additionalFields.notification_url;
	if (typeof additionalFields.binary_mode === 'boolean') body.binary_mode = additionalFields.binary_mode;
	if (additionalFields.statement_descriptor) body.statement_descriptor = additionalFields.statement_descriptor;
	if (additionalFields.expiration_date_from || additionalFields.expiration_date_to) {
		body.expires = true;
		if (additionalFields.expiration_date_from) body.expiration_date_from = additionalFields.expiration_date_from;
		if (additionalFields.expiration_date_to) body.expiration_date_to = additionalFields.expiration_date_to;
	}
	if (additionalFields.auto_return && additionalFields.auto_return !== 'none') {
		body.auto_return = additionalFields.auto_return;
	}
	if (additionalFields.back_urls?.backUrlsValues) {
		const { success, pending, failure } = additionalFields.back_urls.backUrlsValues;
		const backUrls: { success?: string; pending?: string; failure?: string } = {};
		if (success) backUrls.success = success;
		if (pending) backUrls.pending = pending;
		if (failure) backUrls.failure = failure;
		if (Object.keys(backUrls).length) body.back_urls = backUrls;
	}

	// Request
	const response = await ctx.request({
		method: 'POST',
		url: API_ENDPOINTS.CHECKOUT_PREFERENCES,
		body,
	});

	return response;
};

export default handler;
