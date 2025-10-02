import { describe, it, expect, beforeEach } from 'vitest';
import handler from '../../src/nodes/MercadoPago/operations/getReleaseReportConfig';
import { makeMockCtx } from '../helpers/mockCtx';
import { TestContext, OperationHandler } from '../types/test-types';

describe('getReleaseReportConfig operation', () => {
  let ctx: TestContext;
  const getReleaseReportConfig = handler as OperationHandler;
  
  const mockConfig = {
    id: 'config_123',
    columns: [
      { key: 'date' },
      { key: 'user_id' }
    ],
    file_name_prefix: 'report_prefix',
    frequency: { 
      hour: 12, 
      value: 1, 
      type: 'daily' 
    },
    include_withdrawal_at_end: false,
    check_available_balance: true,
    compensate_detail: false,
    execute_after_withdrawal: false,
    scheduled: true
  };
  
  beforeEach(() => {
    ctx = makeMockCtx({
      params: {},
      requestImpl: async () => mockConfig
    }) as TestContext;
  });

  it('should perform GET request to the correct endpoint', async () => {
    await getReleaseReportConfig(ctx);
    
    expect(ctx.lastRequest).toBeDefined();
    expect(ctx.lastRequest?.method).toBe('GET');
    expect(ctx.lastRequest?.url).toBe('https://api.mercadopago.com/v1/account/release_report/config');
  });

  it('should return the configuration as received from the API', async () => {
    const result = await getReleaseReportConfig(ctx);
    
    expect(result).toEqual(mockConfig);
  });

  it('should handle API errors gracefully', async () => {
    ctx = makeMockCtx({
      params: {},
      requestImpl: async () => {
        throw new Error('API Error');
      }
    }) as TestContext;

    await expect(getReleaseReportConfig(ctx)).rejects.toThrow('API Error');
  });

  it('should handle empty response', async () => {
    ctx = makeMockCtx({
      params: {},
      requestImpl: async () => ({})
    }) as TestContext;

    const result = await getReleaseReportConfig(ctx);
    expect(result).toEqual({});
  });
});
