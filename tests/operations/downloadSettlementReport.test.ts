import { describe, it, expect, beforeEach } from 'vitest';
import handler from '../../src/nodes/MercadoPago/operations/downloadSettlementReport';
import { makeMockCtx } from '../helpers/mockCtx';
import { TestContext, OperationHandler } from '../types/test-types';

describe('downloadSettlementReport operation', () => {
  let ctx: TestContext;
  const downloadSettlementReport = handler as OperationHandler;
  
  beforeEach(() => {
    ctx = makeMockCtx({
      params: {
        file_name: 'settlement_20240101.csv'
      },
      requestImpl: async () => 'date,amount,description\n2024-01-01,100.00,Settlement'
    }) as TestContext;
  });

  it('should validate file_name is required', async () => {
    ctx = makeMockCtx({
      params: {
        file_name: ''
      }
    }) as TestContext;

    await expect(downloadSettlementReport(ctx)).rejects.toThrow(
      'Parameter "File Name" is required.'
    );
  });

  it('should perform GET request with proper headers', async () => {
    await downloadSettlementReport(ctx);
    
    expect(ctx.lastRequest).toBeDefined();
    expect(ctx.lastRequest?.method).toBe('GET');
    expect(ctx.lastRequest?.url).toBe('https://api.mercadopago.com/v1/account/settlement_report/settlement_20240101.csv');
    expect(ctx.lastRequest?.headers).toMatchObject({ Accept: 'text/csv' });
    expect(ctx.lastRequest?.json).toBe(false);
  });

  it('should handle URL encoding for file names with special characters', async () => {
    ctx = makeMockCtx({
      params: {
        file_name: 'settlement with spaces & special chars.csv'
      },
      requestImpl: async (init) => {
        expect(init.url).toBe('https://api.mercadopago.com/v1/account/settlement_report/settlement%20with%20spaces%20%26%20special%20chars.csv');
        return 'csv content';
      }
    }) as TestContext;

    await downloadSettlementReport(ctx);
  });

  it('should return properly formatted response with CSV content', async () => {
    const csvContent = 'date,amount,description\n2024-01-01,100.00,Settlement';
    ctx = makeMockCtx({
      params: {
        file_name: 'settlement_20240101.csv'
      },
      requestImpl: async () => csvContent
    }) as TestContext;

    const result = await downloadSettlementReport(ctx);
    
    expect(result).toEqual({
      file_name: 'settlement_20240101.csv',
      content_type: 'text/csv',
      content: csvContent
    });
  });

  it('should convert non-string responses to strings', async () => {
    ctx = makeMockCtx({
      params: {
        file_name: 'settlement_20240101.csv'
      },
      requestImpl: async () => ({ toString: () => 'converted content' })
    }) as TestContext;

    const result = await downloadSettlementReport(ctx);
    
    expect(result.content).toBe('converted content');
  });
});
