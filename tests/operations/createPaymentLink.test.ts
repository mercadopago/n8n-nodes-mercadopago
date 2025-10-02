import { describe, it, expect, beforeEach } from 'vitest';
import handler from '../../src/nodes/MercadoPago/operations/createPaymentLink';
import { makeMockCtx } from '../helpers/mockCtx';
import { TestContext, OperationHandler } from '../types/test-types';

const baseItem = {
  itemsValues: [
    {
      title: 'Test Product',
      quantity: 2,
      currency_id: 'ARS',
      unit_price: 1500.5,
    },
  ],
};

describe('createPaymentLink operation', () => {
  let ctx: TestContext;
  const createPaymentLink = handler as OperationHandler;
  
  beforeEach(() => {
    ctx = makeMockCtx({
      params: {
        items: baseItem,
      },
    }) as TestContext;
  });
  it('should throw on invalid external_reference', async () => {
    ctx = makeMockCtx({
      params: {
        items: baseItem,
        additionalFields: {
          external_reference: 'INVALID SPACE !',
        },
      },
    }) as TestContext;

    await expect(createPaymentLink(ctx)).rejects.toThrow(
      'Invalid External Reference. Must be <= 64 chars and only letters, numbers, hyphen (-), underscore (_).',
    );
  });

  it('should require https or deeplink success URL when auto_return is set', async () => {
    ctx = makeMockCtx({
      params: {
        items: baseItem,
        additionalFields: {
          auto_return: 'approved',
          back_urls: { backUrlsValues: { success: 'http://insecure.example.com' } },
        },
      },
    }) as TestContext;

    await expect(createPaymentLink(ctx)).rejects.toThrow(
      'Back URLs → Success must be https:// or a deeplink (e.g. myapp://...). http is not allowed.',
    );
  });

  it('should validate notification_url is https', async () => {
    ctx = makeMockCtx({
      params: {
        items: baseItem,
        additionalFields: {
          notification_url: 'http://not-https.example.com/webhook',
        },
      },
    }) as TestContext;

    await expect(createPaymentLink(ctx)).rejects.toThrow(
      'Notification URL must start with https:// and be at most 248 characters.',
    );
  });

  it('should validate statement_descriptor length', async () => {
    ctx = makeMockCtx({
      params: {
        items: baseItem,
        additionalFields: {
          statement_descriptor: 'THIS_IS_TOO_LONG_DESC',
        },
      },
    }) as TestContext;

    await expect(createPaymentLink(ctx)).rejects.toThrow(
      'Statement Descriptor must be at most 13 characters.',
    );
  });

  it('should validate expiration date ordering', async () => {
    ctx = makeMockCtx({
      params: {
        items: baseItem,
        additionalFields: {
          expiration_date_from: '2024-01-02T00:00:00Z',
          expiration_date_to: '2024-01-01T00:00:00Z',
        },
      },
    }) as TestContext;

    await expect(createPaymentLink(ctx)).rejects.toThrow(
      'Expiration Date From must be earlier than or equal to Expiration Date To.',
    );
  });

  it('should perform POST to preferences with mapped body (happy path)', async () => {
    ctx = makeMockCtx({
      params: {
        items: baseItem,
        additionalFields: {
          external_reference: 'ORDER_123',
          notification_url: 'https://example.com/webhook',
          binary_mode: true,
          statement_descriptor: 'MYSHOP',
          auto_return: 'approved',
          back_urls: {
            backUrlsValues: {
              success: 'https://example.com/success',
              pending: 'myapp://pending',
            },
          },
          expiration_date_from: '2024-01-01T00:00:00Z',
          expiration_date_to: '2024-02-01T00:00:00Z',
        },
      },
      requestImpl: async () => ({ id: 'pref_123' }),
    }) as TestContext;

    const res = await createPaymentLink(ctx);

    // Verificar la respuesta completa
    expect(res).toEqual({ id: 'pref_123' });
    
    // Verificar que se hizo la solicitud correctamente
    expect(ctx.lastRequest).toBeDefined();
    expect(ctx.lastRequest?.method).toBe('POST');
    expect(ctx.lastRequest?.url).toBe('https://api.mercadopago.com/checkout/preferences');

    // Verificar la estructura del cuerpo de la solicitud (usando toMatchObject para permitir campos adicionales)
    expect(ctx.lastRequest?.body).toMatchObject({
      items: [
        {
          title: 'Test Product',
          quantity: 2,
          currency_id: 'ARS',
          unit_price: 1500.5,
        },
      ],
      external_reference: 'ORDER_123',
      notification_url: 'https://example.com/webhook',
      binary_mode: true,
      statement_descriptor: 'MYSHOP',
      auto_return: 'approved',
      back_urls: {
        success: 'https://example.com/success',
        pending: 'myapp://pending',
      },
      expires: true,
      expiration_date_from: '2024-01-01T00:00:00Z',
      expiration_date_to: '2024-02-01T00:00:00Z',
    });
  });

  it('should handle API errors gracefully', async () => {
    const errorResponse = {
      status: 400,
      message: 'Invalid request data',
      error: 'bad_request',
      cause: ['Invalid item price']
    };

    ctx = makeMockCtx({
      params: { items: baseItem },
      requestImpl: async () => {
        const error: any = new Error('API Error');
        error.response = { data: errorResponse };
        throw error;
      },
    }) as TestContext;

    await expect(createPaymentLink(ctx)).rejects.toThrow(/API Error/);
  });

  it('should handle network errors', async () => {
    ctx = makeMockCtx({
      params: { items: baseItem },
      requestImpl: async () => {
        throw new Error('Network error: Connection timeout');
      },
    }) as TestContext;

    await expect(createPaymentLink(ctx)).rejects.toThrow(/Network error/);
  });

  it('should handle empty items array', async () => {
    ctx = makeMockCtx({
      params: {
        items: { itemsValues: [] },
      },
    }) as TestContext;

    // Verificamos que devuelva un objeto vacío o algún valor sin error
    const result = await createPaymentLink(ctx);
    expect(result).toBeDefined();
  });

  it('should handle extremely long input values', async () => {
    const longString = 'a'.repeat(300);
    ctx = makeMockCtx({
      params: {
        items: baseItem,
        additionalFields: {
          external_reference: longString,
        },
      },
    }) as TestContext;

    await expect(createPaymentLink(ctx)).rejects.toThrow(/External Reference/);
  });
});
