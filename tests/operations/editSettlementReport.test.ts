import { describe, it, expect, beforeEach } from 'vitest';
import handler from '../../src/nodes/MercadoPago/operations/editSettlementReport';
import { makeMockCtx } from '../helpers/mockCtx';
import { TestContext, OperationHandler } from '../types/test-types';

describe('editSettlementReport operation', () => {
  let ctx: TestContext;
  const editSettlementReport = handler as OperationHandler;
  
  const baseParams = {
    columns: {
      columnsValues: [
        { keySource: 'EXTERNAL_REFERENCE' },
        { keySource: 'TRANSACTION_AMOUNT' },
        { keySource: 'SETTLEMENT_DATE' }
      ]
    },
    file_name_prefix: 'updated_settlement',
    frequency: {
      frequencyValues: {
        hour: 15,
        value: 2,
        type: 'weekly'
      }
    }
  };
  
  beforeEach(() => {
    ctx = makeMockCtx({
      params: { ...baseParams },
      requestImpl: async () => ({ id: 'config_settlement_456', updated: true })
    }) as TestContext;
  });

  it('should validate required columns', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        columns: { columnsValues: [] }
      }
    }) as TestContext;

    await expect(editSettlementReport(ctx)).rejects.toThrow(
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

    await expect(editSettlementReport(ctx)).rejects.toThrow(
      '"File Name Prefix" is required and cannot be empty.'
    );
  });

  it('should validate frequency hour range', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        frequency: {
          frequencyValues: {
            hour: -1, // Invalid: should be 0-23
            value: 2,
            type: 'weekly'
          }
        }
      }
    }) as TestContext;

    await expect(editSettlementReport(ctx)).rejects.toThrow(
      'Frequency → hour must be an integer between 0 and 23.'
    );
  });

  it('should validate frequency value is positive', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        frequency: {
          frequencyValues: {
            hour: 15,
            value: -5, // Invalid: should be > 0
            type: 'weekly'
          }
        }
      }
    }) as TestContext;

    await expect(editSettlementReport(ctx)).rejects.toThrow(
      'Frequency → value must be a positive integer.'
    );
  });

  it('should validate frequency type is valid', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        frequency: {
          frequencyValues: {
            hour: 15,
            value: 2,
            type: 'biweekly' // Invalid: should be daily, weekly, or monthly
          }
        }
      }
    }) as TestContext;

    await expect(editSettlementReport(ctx)).rejects.toThrow(
      "Frequency → type must be one of: 'daily', 'weekly', 'monthly'."
    );
  });

  it('should handle legacy column key format', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        columns: {
          columnsValues: [
            { key: 'LEGACY_KEY_FORMAT' } // Using legacy key format instead of keySource
          ]
        }
      },
      requestImpl: async (init) => {
        expect(init.body.columns).toEqual([{ key: 'LEGACY_KEY_FORMAT' }]);
        return { id: 'config_settlement_456', updated: true };
      }
    }) as TestContext;

    const result = await editSettlementReport(ctx);
    expect(result).toEqual({ id: 'config_settlement_456', updated: true });
  });

  it('should handle custom columns correctly', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        columns: {
          columnsValues: [
            { keySource: 'custom', custom_key: 'CUSTOM_SETTLEMENT_COLUMN' }
          ]
        }
      },
      requestImpl: async (init) => {
        expect(init.body.columns).toEqual([{ key: 'CUSTOM_SETTLEMENT_COLUMN' }]);
        return { id: 'config_settlement_456', updated: true };
      }
    }) as TestContext;

    const result = await editSettlementReport(ctx);
    expect(result).toEqual({ id: 'config_settlement_456', updated: true });
  });

  it('should include sftp_info when provided and prune empty values', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        sftp_info: {
          sftpInfoValues: {
            server: 'sftp.updated.com',
            username: 'updated_user',
            password: 'updated_pass',
            port: 22,
            remote_dir: '' // Empty value should be pruned
          }
        }
      },
      requestImpl: async (init) => {
        expect(init.body.sftp_info).toMatchObject({
          server: 'sftp.updated.com',
          username: 'updated_user',
          password: 'updated_pass',
          port: 22
          // remote_dir should be pruned
        });
        expect(init.body.sftp_info.remote_dir).toBeUndefined();
        return { id: 'config_settlement_456', updated: true };
      }
    }) as TestContext;

    const result = await editSettlementReport(ctx);
    expect(result).toEqual({ id: 'config_settlement_456', updated: true });
  });

  it('should include settlement additional fields when provided', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        settlementAdditionalFields: {
          separator: '|',
          display_timezone: 'America/Sao_Paulo',
          report_translation: 'pt',
          notification_email_list: {
            emails: [
              { value: 'updated@example.com' }
            ]
          },
          scheduled: true
        }
      },
      requestImpl: async (init) => {
        expect(init.body.separator).toBe('|');
        expect(init.body.display_timezone).toBe('America/Sao_Paulo');
        expect(init.body.report_translation).toBe('pt');
        expect(init.body.notification_email_list).toEqual(['updated@example.com']);
        expect(init.body.scheduled).toBe(true);
        return { id: 'config_settlement_456', updated: true };
      }
    }) as TestContext;

    const result = await editSettlementReport(ctx);
    expect(result).toEqual({ id: 'config_settlement_456', updated: true });
  });

  it('should perform PUT to settlement_report/config endpoint (happy path)', async () => {
    const result = await editSettlementReport(ctx);
    
    expect(result).toEqual({ id: 'config_settlement_456', updated: true });
    expect(ctx.lastRequest).toBeDefined();
    expect(ctx.lastRequest?.method).toBe('PUT');
    expect(ctx.lastRequest?.url).toBe('https://api.mercadopago.com/v1/account/settlement_report/config');
    
    expect(ctx.lastRequest?.body).toMatchObject({
      columns: [
        { key: 'EXTERNAL_REFERENCE' },
        { key: 'TRANSACTION_AMOUNT' },
        { key: 'SETTLEMENT_DATE' }
      ],
      file_name_prefix: 'updated_settlement',
      frequency: { hour: 15, value: 2, type: 'weekly' },
      scheduled: false
    });
  });
});
