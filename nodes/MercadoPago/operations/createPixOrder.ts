import { API_ENDPOINTS } from "../../../constants";
import type { OperationHandler } from "./index";

type PixPaymentMethod = {
  id?: string;
  type?: string;
  ticket_url?: string;
  qr_code?: string;
  qr_code_base64?: string;
};

type PixPayment = {
  id?: string;
  status?: string;
  status_detail?: string;
  amount?: string;
  payment_method?: PixPaymentMethod;
};

type PixOrderResponse = Record<string, unknown> & {
  id?: string;
  status?: string;
  status_detail?: string;
  total_amount?: string;
  external_reference?: string;
  transactions?: { payments?: PixPayment[] };
};

const EXTERNAL_REFERENCE = /^[A-Za-z0-9._-]{1,64}$/;
const IDEMPOTENCY_KEY = /^[A-Za-z0-9_-]{1,64}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DURATION = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/;

function validateExpiration(
  ctx: Parameters<OperationHandler>[0],
  value: string,
): string {
  const duration = value.trim();
  const match = ISO_DURATION.exec(duration);
  if (!match || !match.slice(1).some(Boolean)) {
    ctx.nodeError(
      "Expiration Time must be an ISO 8601 duration such as 'PT30M', 'PT24H', or 'P7D'.",
    );
  }

  const minutes =
    Number(match[1] ?? 0) * 24 * 60 +
    Number(match[2] ?? 0) * 60 +
    Number(match[3] ?? 0);
  if (minutes < 30 || minutes > 30 * 24 * 60) {
    ctx.nodeError("Expiration Time must be between 30 minutes and 30 days.");
  }
  return duration;
}

/**
 * Create and automatically process a Pix payment through Checkout API Orders.
 *
 * The request includes an explicit idempotency key so an n8n execution can be
 * retried safely without accidentally creating a duplicate charge.
 */
const handler: OperationHandler = async (ctx) => {
  const amount = Number(ctx.get<number | string>("total_amount"));
  if (!Number.isFinite(amount) || amount <= 0) {
    ctx.nodeError("Total Amount must be a number greater than 0.");
  }
  const totalAmount = amount.toFixed(2);

  const payerEmail = ctx.get<string>("payer_email", "").trim();
  if (!EMAIL.test(payerEmail)) {
    ctx.nodeError("Payer Email must be a valid email address.");
  }

  const externalReference = ctx.get<string>("external_reference", "").trim();
  if (!EXTERNAL_REFERENCE.test(externalReference)) {
    ctx.nodeError(
      "External Reference must be 1-64 characters and use only letters, numbers, dot, hyphen, or underscore.",
    );
  }

  const idempotencyKey = ctx.get<string>("idempotency_key", "").trim();
  if (!IDEMPOTENCY_KEY.test(idempotencyKey)) {
    ctx.nodeError(
      "Idempotency Key must be 1-64 characters and use only letters, numbers, hyphen, or underscore.",
    );
  }

  const expirationTime = validateExpiration(
    ctx,
    ctx.get<string>("expiration_time", "PT24H"),
  );

  const response = await ctx.request<PixOrderResponse>({
    method: "POST",
    url: API_ENDPOINTS.ORDERS,
    headers: {
      "X-Idempotency-Key": idempotencyKey,
    },
    body: {
      type: "online",
      total_amount: totalAmount,
      external_reference: externalReference,
      processing_mode: "automatic",
      transactions: {
        payments: [
          {
            amount: totalAmount,
            payment_method: {
              id: "pix",
              type: "bank_transfer",
            },
            expiration_time: expirationTime,
          },
        ],
      },
      payer: {
        email: payerEmail,
      },
    },
  });

  if (!ctx.get<boolean>("simplify", true)) return response;

  const payment = response.transactions?.payments?.[0];
  return {
    id: response.id,
    status: response.status,
    status_detail: response.status_detail,
    total_amount: response.total_amount,
    external_reference: response.external_reference,
    payment_id: payment?.id,
    payment_status: payment?.status,
    payment_status_detail: payment?.status_detail,
    ticket_url: payment?.payment_method?.ticket_url,
    qr_code: payment?.payment_method?.qr_code,
    qr_code_base64: payment?.payment_method?.qr_code_base64,
  };
};

export default handler;
