import { describe, expect, it } from "vitest";
import handler from "../../nodes/MercadoPago/operations/createPixOrder";
import { makeMockCtx } from "../helpers/mockCtx";
import type { OperationHandler, TestContext } from "../types/test-types";

const createPixOrder = handler as OperationHandler;

const validParams = {
  total_amount: 50,
  payer_email: "buyer@example.com",
  external_reference: "order-12345",
  idempotency_key: "255c9866-ea68-42f8-9f02-493cd6cdd159",
  expiration_time: "PT24H",
};

describe("createPixOrder operation", () => {
  it("creates an automatic Pix order with a safe idempotency key", async () => {
    const apiResponse = {
      id: "ORD01TEST",
      status: "action_required",
      status_detail: "waiting_transfer",
      total_amount: "50.00",
      external_reference: "order-12345",
      transactions: {
        payments: [
          {
            id: "PAY01TEST",
            status: "action_required",
            status_detail: "waiting_transfer",
            payment_method: {
              id: "pix",
              type: "bank_transfer",
              ticket_url: "https://www.mercadopago.com.br/payments/test/ticket",
              qr_code: "00020101021226TEST",
              qr_code_base64: "iVBORw0KGgoAAAANSUhEUgAA",
            },
          },
        ],
      },
    };
    const ctx = makeMockCtx({
      params: validParams,
      requestImpl: async () => apiResponse,
    }) as TestContext;

    const result = await createPixOrder(ctx);

    expect(ctx.lastRequest).toEqual({
      method: "POST",
      url: "https://api.mercadopago.com/v1/orders",
      headers: {
        "X-Idempotency-Key": validParams.idempotency_key,
      },
      body: {
        type: "online",
        total_amount: "50.00",
        external_reference: "order-12345",
        processing_mode: "automatic",
        transactions: {
          payments: [
            {
              amount: "50.00",
              payment_method: {
                id: "pix",
                type: "bank_transfer",
              },
              expiration_time: "PT24H",
            },
          ],
        },
        payer: {
          email: "buyer@example.com",
        },
      },
    });
    expect(result).toEqual({
      id: "ORD01TEST",
      status: "action_required",
      status_detail: "waiting_transfer",
      total_amount: "50.00",
      external_reference: "order-12345",
      payment_id: "PAY01TEST",
      payment_status: "action_required",
      payment_status_detail: "waiting_transfer",
      ticket_url: "https://www.mercadopago.com.br/payments/test/ticket",
      qr_code: "00020101021226TEST",
      qr_code_base64: "iVBORw0KGgoAAAANSUhEUgAA",
    });
  });

  it("returns the complete API response when Simplify is disabled", async () => {
    const apiResponse = { id: "ORD01RAW", metadata: { source: "test" } };
    const ctx = makeMockCtx({
      params: { ...validParams, simplify: false },
      requestImpl: async () => apiResponse,
    }) as TestContext;

    await expect(createPixOrder(ctx)).resolves.toBe(apiResponse);
  });

  it.each([
    [{ total_amount: 0 }, "Total Amount"],
    [{ total_amount: Number.NaN }, "Total Amount"],
    [{ payer_email: "invalid-email" }, "Payer Email"],
    [{ external_reference: "reference with spaces" }, "External Reference"],
    [{ idempotency_key: "bad\r\nheader" }, "Idempotency Key"],
    [{ expiration_time: "PT29M" }, "Expiration Time"],
    [{ expiration_time: "P31D" }, "Expiration Time"],
    [{ expiration_time: "tomorrow" }, "Expiration Time"],
  ])("rejects invalid input %o", async (override, expectedMessage) => {
    const ctx = makeMockCtx({
      params: { ...validParams, ...override },
    }) as TestContext;

    await expect(createPixOrder(ctx)).rejects.toThrow(expectedMessage);
    expect(ctx.lastRequest).toBeUndefined();
  });

  it.each(["PT30M", "P30D"])(
    "accepts the documented expiration boundary %s",
    async (expirationTime) => {
      const ctx = makeMockCtx({
        params: { ...validParams, expiration_time: expirationTime },
        requestImpl: async () => ({ id: "ORD01BOUNDARY" }),
      }) as TestContext;

      await createPixOrder(ctx);

      expect(
        (ctx.lastRequest?.body as any).transactions.payments[0].expiration_time,
      ).toBe(expirationTime);
    },
  );
});
