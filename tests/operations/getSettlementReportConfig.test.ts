import { describe, it, expect } from 'vitest';
import handler from '../../src/nodes/MercadoPago/operations/getSettlementReportConfig';
import { makeMockCtx } from '../helpers/mockCtx';
import { TestContext, OperationHandler } from '../types/test-types';

describe('getSettlementReportConfig operation', () => {
  const getSettlementReportConfig = handler as OperationHandler;
  
  it('should perform GET request to settlement_report/config endpoint', async () => {
    const mockResponse = {
      id: 'settlement_config_789',
      file_name_prefix: 'settlement_report',
      columns: [
        { key: 'EXTERNAL_REFERENCE' },
        { key: 'TRANSACTION_AMOUNT' },
        { key: 'SETTLEMENT_DATE' }
      ],
      frequency: {
        hour: 8,
        value: 1,
        type: 'daily'
      },
      scheduled: true
    };
    
    const ctx = makeMockCtx({
      requestImpl: async (init) => {
        expect(init.method).toBe('GET');
        expect(init.url).toBe('https://api.mercadopago.com/v1/account/settlement_report/config');
        return mockResponse;
      }
    }) as TestContext;
    
    const result = await getSettlementReportConfig(ctx);
    
    expect(result).toEqual(mockResponse);
    expect(ctx.lastRequest).toBeDefined();
    expect(ctx.lastRequest?.method).toBe('GET');
    expect(ctx.lastRequest?.url).toBe('https://api.mercadopago.com/v1/account/settlement_report/config');
  });
  
  it('should handle empty response', async () => {
    const ctx = makeMockCtx({
      requestImpl: async () => ({})
    }) as TestContext;
    
    const result = await getSettlementReportConfig(ctx);
    expect(result).toEqual({});
  });
  
  it('should handle error response', async () => {
    const errorResponse = {
      status: 404,
      message: 'Settlement report configuration not found',
      error: 'not_found'
    };
    
    const ctx = makeMockCtx({
      requestImpl: async () => {
        return errorResponse;
      }
    }) as TestContext;
    
    const result = await getSettlementReportConfig(ctx);
    expect(result).toEqual(errorResponse);
  });
  
  it('should handle full configuration response', async () => {
    const fullConfigResponse = {
      id: 'settlement_config_789',
      file_name_prefix: 'detailed_settlement',
      columns: [
        { key: 'EXTERNAL_REFERENCE' },
        { key: 'SOURCE_ID' },
        { key: 'USER_ID' },
        { key: 'PAYMENT_METHOD' },
        { key: 'PAYMENT_METHOD_TYPE' },
        { key: 'TRANSACTION_AMOUNT' },
        { key: 'TRANSACTION_CURRENCY' },
        { key: 'SETTLEMENT_DATE' }
      ],
      frequency: {
        hour: 22,
        value: 1,
        type: 'weekly'
      },
      sftp_info: {
        server: 'sftp.example.com',
        username: 'user123',
        port: 22,
        remote_dir: '/reports/settlement'
      },
      separator: ',',
      display_timezone: 'GMT-03',
      report_translation: 'es',
      notification_email_list: [
        'finance@example.com',
        'accounting@example.com'
      ],
      scheduled: true
    };
    
    const ctx = makeMockCtx({
      requestImpl: async () => fullConfigResponse
    }) as TestContext;
    
    const result = await getSettlementReportConfig(ctx);
    
    expect(result).toEqual(fullConfigResponse);
    expect(result.columns.length).toBe(8);
    expect(result.notification_email_list.length).toBe(2);
    expect(result.frequency.type).toBe('weekly');
  });
});
