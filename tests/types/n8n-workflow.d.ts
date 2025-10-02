// Minimal ambient declarations for the `n8n-workflow` package used in tests.
// This avoids pulling the full n8n dependency and is sufficient for type-checking.

declare module 'n8n-workflow' {
  export interface IRequestOptions {
    method: string;
    url: string;
    qs?: Record<string, any>;
    body?: any;
    headers?: Record<string, string>;
  }

  export interface IExecuteFunctions {
    helpers: any;
  }
}
