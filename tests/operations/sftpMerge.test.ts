import { describe, it, expect } from 'vitest';
import { parseSftpInfo } from '../../src/nodes/MercadoPago/operations/utils';
import { makeMockCtx } from '../helpers/mockCtx';
import { TestContext } from '../types/test-types';

describe('parseSftpInfo merge logic', () => {
  it('should return undefined when no credential and no params', () => {
    const ctx = makeMockCtx({ params: {} }) as TestContext;
    expect(parseSftpInfo(ctx)).toBeUndefined();
  });

  it('should use only credential values when no node params', () => {
    const ctx = makeMockCtx({
      params: {},
      sftpCredentials: {
        server: 'cred.example.com',
        username: 'cred_user',
        password: 'cred_pass',
        remote_dir: '/cred/dir',
        port: 2222,
      },
    }) as TestContext;

    expect(parseSftpInfo(ctx)).toEqual({
      server: 'cred.example.com',
      username: 'cred_user',
      password: 'cred_pass',
      remote_dir: '/cred/dir',
      port: 2222,
    });
  });

  it('should use only node param values when no credential', () => {
    const ctx = makeMockCtx({
      params: {
        sftp_info: {
          sftpInfoValues: {
            server: 'param.example.com',
            username: 'param_user',
            password: 'param_pass',
            remote_dir: '/param/dir',
            port: 3333,
          },
        },
      },
    }) as TestContext;

    expect(parseSftpInfo(ctx)).toEqual({
      server: 'param.example.com',
      username: 'param_user',
      password: 'param_pass',
      remote_dir: '/param/dir',
      port: 3333,
    });
  });

  it('should override credential with non-empty param values (partial override)', () => {
    const ctx = makeMockCtx({
      params: {
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
    }) as TestContext;

    const result = parseSftpInfo(ctx);
    expect(result).toEqual({
      server: 'override.example.com',
      username: 'cred_user',
      password: 'cred_pass',
      remote_dir: '/cred/dir',
      port: 2222,
    });
  });

  it('should override port from credential when param port > 0', () => {
    const ctx = makeMockCtx({
      params: {
        sftp_info: {
          sftpInfoValues: { port: 9999 },
        },
      },
      sftpCredentials: { port: 2222 },
    }) as TestContext;

    const result = parseSftpInfo(ctx);
    expect(result).toEqual({ port: 9999 });
  });

  it('should prune fields that are empty after merge', () => {
    const ctx = makeMockCtx({
      params: {
        sftp_info: {
          sftpInfoValues: {
            server: '  ',
            username: '',
          },
        },
      },
      sftpCredentials: {
        server: '',
        username: '  ',
      },
    }) as TestContext;

    expect(parseSftpInfo(ctx)).toBeUndefined();
  });

  it('should return undefined when both sources produce empty values', () => {
    const ctx = makeMockCtx({
      params: {
        sftp_info: {
          sftpInfoValues: {
            server: '',
            port: 0,
          },
        },
      },
      sftpCredentials: {
        server: '',
        port: 0,
      },
    }) as TestContext;

    expect(parseSftpInfo(ctx)).toBeUndefined();
  });

  it('should preserve spaces in credential password', () => {
    const ctx = makeMockCtx({
      params: {},
      sftpCredentials: {
        password: '  spaced pass  ',
      },
    }) as TestContext;

    const result = parseSftpInfo(ctx);
    expect(result).toEqual({ password: '  spaced pass  ' });
  });

  it('should override password from credential without trimming', () => {
    const ctx = makeMockCtx({
      params: {
        sftp_info: {
          sftpInfoValues: {
            password: ' new pass ',
          },
        },
      },
      sftpCredentials: {
        password: 'old_pass',
      },
    }) as TestContext;

    const result = parseSftpInfo(ctx);
    expect(result).toEqual({ password: ' new pass ' });
  });
});
