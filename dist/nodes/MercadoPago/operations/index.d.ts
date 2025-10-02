import type { IRequestOptions } from 'n8n-workflow';
import type { IExecuteFunctions } from 'n8n-workflow';
/**
 * Context object passed to each operation handler. It contains:
 * - `i`: current item index being processed by n8n.
 * - `get(name, def?)`: reads a parameter from the node UI for the current item.
 * - `request(init)`: performs an HTTP request using n8n helpers with auth headers.
 * - `credentials`: Mercado Pago credentials (access token).
 * - `nodeError(msg)`: throw an n8n `NodeOperationError` with item context.
 * - `helpers`: a reference to `IExecuteFunctions['helpers']`.
 */
export type HandlerCtx = {
    i: number;
    get: <T = unknown>(name: string, def?: T) => T;
    request: (init: Omit<IRequestOptions, 'headers'> & {
        headers?: Record<string, string>;
    }) => Promise<any>;
    credentials: {
        accessToken: string;
    };
    nodeError: (msg: string) => never;
    helpers: IExecuteFunctions['helpers'];
};
/**
 * Signature for an operation handler. Each handler must be an async function
 * that receives a `HandlerCtx` and returns any serializable value to be output
 * as node data.
 */
export type OperationHandler = (ctx: HandlerCtx) => Promise<any>;
/**
 * Registry mapping operation keys (selected in the node UI) to their concrete
 * handler implementation.
 */
export declare const operations: Record<string, OperationHandler>;
