import { describe, it, expect, beforeEach } from 'vitest';
import handler from '../../src/nodes/MercadoPago/operations/configureSettlementReport';
import { makeMockCtx } from '../helpers/mockCtx';
import { TestContext, OperationHandler } from '../types/test-types';

describe('configureSettlementReport operation', () => {
  let ctx: TestContext;
  const configureSettlementReport = handler as OperationHandler;
  
  const baseParams = {
    columns: {
      columnsValues: [
        { keySource: 'EXTERNAL_REFERENCE' },
        { keySource: 'TRANSACTION_AMOUNT' }
      ]
    },
    file_name_prefix: 'settlement_report',
    frequency: {
      frequencyValues: {
        hour: 10,
        value: 1,
        type: 'monthly'
      }
    }
  };
  
  beforeEach(() => {
    ctx = makeMockCtx({
      params: { ...baseParams },
      requestImpl: async () => ({ id: 'config_settlement_123' })
    }) as TestContext;
  });

  it('should validate required columns', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        columns: { columnsValues: [] }
      }
    }) as TestContext;

    await expect(configureSettlementReport(ctx)).rejects.toThrow(
      'At least one column with a non-empty "key" is required.'
    );
  });

  it('should validate file_name_prefix is required', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        file_name_prefix: ''
      }
    }) as TestContext;

    await expect(configureSettlementReport(ctx)).rejects.toThrow(
      '"File Name Prefix" is required and cannot be empty.'
    );
  });

  it('should validate frequency hour range', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        frequency: {
          frequencyValues: {
            hour: 24, // Invalid: should be 0-23
            value: 1,
            type: 'monthly'
          }
        }
      }
    }) as TestContext;

    await expect(configureSettlementReport(ctx)).rejects.toThrow(
      'Frequency → hour must be an integer between 0 and 23.'
    );
  });

  it('should validate frequency value is positive', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        frequency: {
          frequencyValues: {
            hour: 10,
            value: 0, // Invalid: should be > 0
            type: 'monthly'
          }
        }
      }
    }) as TestContext;

    await expect(configureSettlementReport(ctx)).rejects.toThrow(
      'Frequency → value must be a positive integer.'
    );
  });

  it('should validate frequency type is valid', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        frequency: {
          frequencyValues: {
            hour: 10,
            value: 1,
            type: 'quarterly' // Invalid: should be daily, weekly, or monthly
          }
        }
      }
    }) as TestContext;

    await expect(configureSettlementReport(ctx)).rejects.toThrow(
      "Frequency → type must be one of: 'daily', 'weekly', 'monthly'."
    );
  });

  it('should handle custom columns correctly', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        columns: {
          columnsValues: [
            { keySource: 'custom', custom_key: 'CUSTOM_SETTLEMENT_FIELD' }
          ]
        }
      },
      requestImpl: async (init) => {
        expect(init.body.columns).toEqual([{ key: 'CUSTOM_SETTLEMENT_FIELD' }]);
        return { id: 'config_settlement_123' };
      }
    }) as TestContext;

    const result = await configureSettlementReport(ctx);
    expect(result).toEqual({ id: 'config_settlement_123' });
  });

  it('should include sftp_info from credential when provided', async () => {
    ctx = makeMockCtx({
      params: { ...baseParams },
      sftpCredentials: {
        server: 'sftp.settlement.com',
        username: 'settlement_user',
        password: 'settlement_pass',
        port: 2222,
        remote_dir: '/settlement/reports',
      },
      requestImpl: async (init) => {
        expect(init.body.sftp_info).toEqual({
          server: 'sftp.settlement.com',
          username: 'settlement_user',
          password: 'settlement_pass',
          port: 2222,
          remote_dir: '/settlement/reports',
        });
        return { id: 'config_settlement_123' };
      },
    }) as TestContext;

    const result = await configureSettlementReport(ctx);
    expect(result).toEqual({ id: 'config_settlement_123' });
  });

  it('should include settlement additional fields when provided', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        settlementAdditionalFields: {
          separator: ';',
          display_timezone: 'GMT-03',
          report_translation: 'en',
          notification_email_list: {
            emails: [
              { value: 'settlement@example.com' },
              { value: 'finance@example.com' }
            ]
          },
          scheduled: true
        }
      },
      requestImpl: async (init) => {
        expect(init.body.separator).toBe(';');
        expect(init.body.display_timezone).toBe('GMT-03');
        expect(init.body.report_translation).toBe('en');
        expect(init.body.notification_email_list).toEqual(['settlement@example.com', 'finance@example.com']);
        expect(init.body.scheduled).toBe(true);
        return { id: 'config_settlement_123' };
      }
    }) as TestContext;

    const result = await configureSettlementReport(ctx);
    expect(result).toEqual({ id: 'config_settlement_123' });
  });

  it('should filter out empty email addresses', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        settlementAdditionalFields: {
          notification_email_list: {
            emails: [
              { value: 'valid@example.com' },
              { value: '' },
              { value: '  ' }
            ]
          }
        }
      },
      requestImpl: async (init) => {
        expect(init.body.notification_email_list).toEqual(['valid@example.com']);
        return { id: 'config_settlement_123' };
      }
    }) as TestContext;

    const result = await configureSettlementReport(ctx);
    expect(result).toEqual({ id: 'config_settlement_123' });
  });

  it('should omit sftp_info when no credential is configured', async () => {
    ctx = makeMockCtx({
      params: { ...baseParams },
      requestImpl: async (init) => {
        expect(init.body.sftp_info).toBeUndefined();
        return { id: 'config_settlement_123' };
      },
    }) as TestContext;

    const result = await configureSettlementReport(ctx);
    expect(result).toEqual({ id: 'config_settlement_123' });
  });

  it('should perform POST to settlement_report/config endpoint (happy path)', async () => {
    const result = await configureSettlementReport(ctx);
    
    expect(result).toEqual({ id: 'config_settlement_123' });
    expect(ctx.lastRequest).toBeDefined();
    expect(ctx.lastRequest?.method).toBe('POST');
    expect(ctx.lastRequest?.url).toBe('https://api.mercadopago.com/v1/account/settlement_report/config');
    
    expect(ctx.lastRequest?.body).toMatchObject({
      columns: [
        { key: 'EXTERNAL_REFERENCE' },
        { key: 'TRANSACTION_AMOUNT' }
      ],
      file_name_prefix: 'settlement_report',
      frequency: { hour: 10, value: 1, type: 'monthly' },
      scheduled: false
    });
  });
});
