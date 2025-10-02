import { describe, it, expect, beforeEach } from 'vitest';
import handler from '../../src/nodes/MercadoPago/operations/downloadReleaseReport';
import { makeMockCtx } from '../helpers/mockCtx';
import { TestContext, OperationHandler } from '../types/test-types';

describe('downloadReleaseReport operation', () => {
  let ctx: TestContext;
  const downloadReleaseReport = handler as OperationHandler;
  
  beforeEach(() => {
    ctx = makeMockCtx({
      params: {
        file_name: 'report_20240101.csv'
      },
      requestImpl: async () => 'date,amount,description\n2024-01-01,100.00,Transaction'
    }) as TestContext;
  });

  it('should validate file_name is required', async () => {
    ctx = makeMockCtx({
      params: {
        file_name: ''
      }
    }) as TestContext;

    await expect(downloadReleaseReport(ctx)).rejects.toThrow(
      'Parameter "File Name" is required.'
    );
  });

  it('should perform GET request with proper headers', async () => {
    await downloadReleaseReport(ctx);
    
    expect(ctx.lastRequest).toBeDefined();
    expect(ctx.lastRequest?.method).toBe('GET');
    expect(ctx.lastRequest?.url).toBe('https://api.mercadopago.com/v1/account/release_report/report_20240101.csv');
    expect(ctx.lastRequest?.headers).toMatchObject({ Accept: 'text/csv' });
    expect(ctx.lastRequest?.json).toBe(false);
  });

  it('should handle URL encoding for file names with special characters', async () => {
    ctx = makeMockCtx({
      params: {
        file_name: 'report with spaces & special chars.csv'
      },
      requestImpl: async (init) => {
        expect(init.url).toBe('https://api.mercadopago.com/v1/account/release_report/report%20with%20spaces%20%26%20special%20chars.csv');
        return 'csv content';
      }
    }) as TestContext;

    await downloadReleaseReport(ctx);
  });

  it('should return properly formatted response with CSV content', async () => {
    const csvContent = 'date,amount,description\n2024-01-01,100.00,Transaction';
    ctx = makeMockCtx({
      params: {
        file_name: 'report_20240101.csv'
      },
      requestImpl: async () => csvContent
    }) as TestContext;

    const result = await downloadReleaseReport(ctx);
    
    expect(result).toEqual({
      file_name: 'report_20240101.csv',
      content_type: 'text/csv',
      content: csvContent
    });
  });

  it('should convert non-string responses to strings', async () => {
    ctx = makeMockCtx({
      params: {
        file_name: 'report_20240101.csv'
      },
      requestImpl: async () => ({ toString: () => 'converted content' })
    }) as TestContext;

    const result = await downloadReleaseReport(ctx);
    
    expect(result.content).toBe('converted content');
  });
});
