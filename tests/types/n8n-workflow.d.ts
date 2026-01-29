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

  export interface INodeExecutionData {
    json: Record<string, unknown>;
    binary?: Record<string, unknown>;
  }

  export interface IExecuteFunctions {
    helpers: any;
    getInputData(): INodeExecutionData[];
    getNodeParameter(name: string, itemIndex: number, fallback?: unknown): unknown;
    getCredentials(name: string): Promise<Record<string, unknown>>;
    getNode(): { name: string };
  }

  export class NodeOperationError extends Error {
    constructor(node: { name: string }, message: string, options?: { itemIndex?: number });
  }
}
