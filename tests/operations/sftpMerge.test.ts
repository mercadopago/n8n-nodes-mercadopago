import { describe, it, expect } from 'vitest';
import { parseSftpInfo } from '../../src/nodes/MercadoPago/operations/utils';
import { makeMockCtx } from '../helpers/mockCtx';
import { TestContext } from '../types/test-types';

describe('parseSftpInfo (credential-only)', () => {
  it('should return undefined when no credential is configured', () => {
    const ctx = makeMockCtx({ params: {} }) as TestContext;
    expect(parseSftpInfo(ctx)).toBeUndefined();
  });

  it('should return full payload from credential', () => {
    const ctx = makeMockCtx({
      params: {},
      sftpCredentials: {
        server: 'sftp.example.com',
        username: 'user',
        password: 'pass',
        remote_dir: '/reports',
        port: 2222,
      },
    }) as TestContext;

    expect(parseSftpInfo(ctx)).toEqual({
      server: 'sftp.example.com',
      username: 'user',
      password: 'pass',
      remote_dir: '/reports',
      port: 2222,
    });
  });

  it('should return only non-empty credential fields (partial credential)', () => {
    const ctx = makeMockCtx({
      params: {},
      sftpCredentials: {
        server: 'sftp.example.com',
        username: '',
        password: '',
        remote_dir: '',
        port: 0,
      },
    }) as TestContext;

    expect(parseSftpInfo(ctx)).toEqual({
      server: 'sftp.example.com',
    });
  });

  it('should return undefined when all credential fields are empty', () => {
    const ctx = makeMockCtx({
      params: {},
      sftpCredentials: {
        server: '',
        username: '  ',
        password: '',
        remote_dir: '',
        port: 0,
      },
    }) as TestContext;

    expect(parseSftpInfo(ctx)).toBeUndefined();
  });

  it('should preserve spaces in credential password (no trim)', () => {
    const ctx = makeMockCtx({
      params: {},
      sftpCredentials: {
        password: '  spaced pass  ',
      },
    }) as TestContext;

    expect(parseSftpInfo(ctx)).toEqual({ password: '  spaced pass  ' });
  });

  it('should omit port when 0 or undefined', () => {
    const ctx = makeMockCtx({
      params: {},
      sftpCredentials: {
        server: 'sftp.example.com',
        port: 0,
      },
    }) as TestContext;

    const result = parseSftpInfo(ctx);
    expect(result).toEqual({ server: 'sftp.example.com' });
    expect(result?.port).toBeUndefined();
  });

  it('should include port when positive', () => {
    const ctx = makeMockCtx({
      params: {},
      sftpCredentials: {
        port: 9999,
      },
    }) as TestContext;

    expect(parseSftpInfo(ctx)).toEqual({ port: 9999 });
  });

  it('should trim string fields from credential', () => {
    const ctx = makeMockCtx({
      params: {},
      sftpCredentials: {
        server: '  sftp.example.com  ',
        username: '  user  ',
        remote_dir: '  /reports  ',
      },
    }) as TestContext;

    expect(parseSftpInfo(ctx)).toEqual({
      server: 'sftp.example.com',
      username: 'user',
      remote_dir: '/reports',
    });
  });
});
