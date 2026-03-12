export type RequestInit = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  qs?: Record<string, any>;
  body?: any;
  form?: any;
  headers?: Record<string, string>;
  json?: boolean;
  timeoutMs?: number;
};

export type SftpCredentials = {
  server?: string;
  username?: string;
  password?: string;
  remote_dir?: string;
  port?: number;
};

export type MockCtxOptions = {
  params?: Record<string, any>;
  requestImpl?: (init: RequestInit) => any | Promise<any>;
  credentials?: { accessToken: string };
  sftpCredentials?: SftpCredentials;
};

/**
 * Lightweight mock context for operation handlers.
 * Provides:
 * - get(key, default)
 * - request(init) with lastRequest capture and injectable implementation
 * - nodeError(message) that throws
 */
export function makeMockCtx(options: MockCtxOptions = {}) {
  const state: { params: Record<string, any>; lastRequest?: RequestInit } = {
    params: options.params ?? {},
    lastRequest: undefined,
  };

  const ctx = {
    get(key: string, defaultValue?: any) {
      return Object.prototype.hasOwnProperty.call(state.params, key)
        ? state.params[key]
        : defaultValue;
    },

    async request<TResponse = any>(init: RequestInit): Promise<TResponse> {
      state.lastRequest = init;
      (ctx as any).lastRequest = init;
      if (options.requestImpl) return await options.requestImpl(init);
      return {} as TResponse;
    },

    nodeError(message: string): never {
      throw new Error(message);
    },

    // Exposed for assertions in tests
    lastRequest: state.lastRequest as RequestInit | undefined,

    credentials: options.credentials ?? { accessToken: 'test-access-token' },

    sftpCredentials: options.sftpCredentials,
  } as const;

  return ctx;
}
