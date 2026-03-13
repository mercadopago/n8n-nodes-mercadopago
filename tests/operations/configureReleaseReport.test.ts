import { describe, it, expect, beforeEach } from 'vitest';
import handler from '../../src/nodes/MercadoPago/operations/configureReleaseReport';
import { makeMockCtx } from '../helpers/mockCtx';
import { TestContext, OperationHandler } from '../types/test-types';

describe('configureReleaseReport operation', () => {
  let ctx: TestContext;
  const configureReleaseReport = handler as OperationHandler;
  
  const baseParams = {
    columns: {
      columnsValues: [
        { key: 'date' },
        { key: 'user_id' }
      ]
    },
    file_name_prefix: 'test_report',
    frequency: {
      frequencyValues: {
        hour: 12,
        value: 1,
        type: 'daily'
      }
    }
  };
  
  beforeEach(() => {
    ctx = makeMockCtx({
      params: { ...baseParams },
      requestImpl: async () => ({ id: 'config_123' })
    }) as TestContext;
  });

  it('should validate required columns', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        columns: { columnsValues: [] }
      }
    }) as TestContext;

    await expect(configureReleaseReport(ctx)).rejects.toThrow(
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

    await expect(configureReleaseReport(ctx)).rejects.toThrow(
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
            type: 'daily'
          }
        }
      }
    }) as TestContext;

    await expect(configureReleaseReport(ctx)).rejects.toThrow(
      'Frequency → hour must be an integer between 0 and 23.'
    );
  });

  it('should validate frequency value is positive', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        frequency: {
          frequencyValues: {
            hour: 12,
            value: 0, // Invalid: should be > 0
            type: 'daily'
          }
        }
      }
    }) as TestContext;

    await expect(configureReleaseReport(ctx)).rejects.toThrow(
      'Frequency → value must be a positive integer.'
    );
  });

  it('should validate frequency type is valid', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        frequency: {
          frequencyValues: {
            hour: 12,
            value: 1,
            type: 'yearly' // Invalid: should be daily, weekly, or monthly
          }
        }
      }
    }) as TestContext;

    await expect(configureReleaseReport(ctx)).rejects.toThrow(
      "Frequency → type must be one of: 'daily', 'weekly', 'monthly'."
    );
  });

  it('should handle custom columns correctly', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        columns: {
          columnsValues: [
            { keySource: 'custom', custom_key: 'custom_column' }
          ]
        }
      },
      requestImpl: async (init) => {
        expect(init.body.columns).toEqual([{ key: 'custom_column' }]);
        return { id: 'config_123' };
      }
    }) as TestContext;

    const result = await configureReleaseReport(ctx);
    expect(result).toEqual({ id: 'config_123' });
  });

  it('should include sftp_info when provided', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        sftp_info: {
          sftpInfoValues: {
            server: 'sftp.example.com',
            username: 'user',
            password: 'pass',
            port: 22,
            remote_dir: '/reports'
          }
        }
      },
      requestImpl: async (init) => {
        expect(init.body.sftp_info).toMatchObject({
          server: 'sftp.example.com',
          username: 'user',
          password: 'pass',
          port: 22,
          remote_dir: '/reports'
        });
        return { id: 'config_123' };
      }
    }) as TestContext;

    const result = await configureReleaseReport(ctx);
    expect(result).toEqual({ id: 'config_123' });
  });

  it('should include additional fields when provided', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        configAdditionalFields: {
          separator: ',',
          display_timezone: 'America/Argentina/Buenos_Aires',
          report_translation: 'es',
          notification_email_list: {
            emails: [
              { value: 'test@example.com' },
              { value: 'another@example.com' }
            ]
          },
          include_withdrawal_at_end: true,
          check_available_balance: true
        }
      },
      requestImpl: async (init) => {
        expect(init.body.separator).toBe(',');
        expect(init.body.display_timezone).toBe('America/Argentina/Buenos_Aires');
        expect(init.body.report_translation).toBe('es');
        expect(init.body.notification_email_list).toEqual(['test@example.com', 'another@example.com']);
        expect(init.body.include_withdrawal_at_end).toBe(true);
        expect(init.body.check_available_balance).toBe(true);
        expect(init.body.compensate_detail).toBe(false);
        expect(init.body.execute_after_withdrawal).toBe(false);
        expect(init.body.scheduled).toBe(false);
        return { id: 'config_123' };
      }
    }) as TestContext;

    const result = await configureReleaseReport(ctx);
    expect(result).toEqual({ id: 'config_123' });
  });

  it('should use SFTP credential values when no node params provided', async () => {
    ctx = makeMockCtx({
      params: { ...baseParams },
      sftpCredentials: {
        server: 'cred-sftp.example.com',
        username: 'cred_user',
        password: 'cred_pass',
        remote_dir: '/cred/reports',
        port: 2222,
      },
      requestImpl: async (init) => {
        expect(init.body.sftp_info).toEqual({
          server: 'cred-sftp.example.com',
          username: 'cred_user',
          password: 'cred_pass',
          remote_dir: '/cred/reports',
          port: 2222,
        });
        return { id: 'config_123' };
      },
    }) as TestContext;

    const result = await configureReleaseReport(ctx);
    expect(result).toEqual({ id: 'config_123' });
  });

  it('should merge SFTP credential with partial node param overrides', async () => {
    ctx = makeMockCtx({
      params: {
        ...baseParams,
        sftp_info: {
          sftpInfoValues: {
            server: 'override.example.com',
            username: '',
            password: '',
            remote_dir: '',
            port: 0,
          },
        },
      },
      sftpCredentials: {
        server: 'cred.example.com',
        username: 'cred_user',
        password: 'cred_pass',
        remote_dir: '/cred/dir',
        port: 2222,
      },
      requestImpl: async (init) => {
        expect(init.body.sftp_info).toEqual({
          server: 'override.example.com',
          username: 'cred_user',
          password: 'cred_pass',
          remote_dir: '/cred/dir',
          port: 2222,
        });
        return { id: 'config_123' };
      },
    }) as TestContext;

    const result = await configureReleaseReport(ctx);
    expect(result).toEqual({ id: 'config_123' });
  });

  it('should perform POST to release_report/config endpoint (happy path)', async () => {
    const result = await configureReleaseReport(ctx);
    
    expect(result).toEqual({ id: 'config_123' });
    expect(ctx.lastRequest).toBeDefined();
    expect(ctx.lastRequest?.method).toBe('POST');
    expect(ctx.lastRequest?.url).toBe('https://api.mercadopago.com/v1/account/release_report/config');
    
    expect(ctx.lastRequest?.body).toMatchObject({
      columns: [
        { key: 'date' },
        { key: 'user_id' }
      ],
      file_name_prefix: 'test_report',
      frequency: { hour: 12, value: 1, type: 'daily' },
      include_withdrawal_at_end: false,
      check_available_balance: false,
      compensate_detail: false,
      execute_after_withdrawal: false,
      scheduled: false
    });
  });
});
