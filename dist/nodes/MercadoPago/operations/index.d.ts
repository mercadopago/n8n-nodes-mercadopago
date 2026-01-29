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
export type MercadoPagoCredentials = {
    accessToken: string;
};
export type RequestInit = {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    qs?: Record<string, string | number | boolean | undefined>;
    body?: Record<string, unknown> | unknown[] | string;
    form?: Record<string, unknown>;
    headers?: Record<string, string>;
    json?: boolean;
    timeoutMs?: number;
};
export type HandlerCtx = {
    i: number;
    get: <T = unknown>(name: string, def?: T) => T;
    request: <TResponse = unknown>(init: RequestInit) => Promise<TResponse>;
    credentials: MercadoPagoCredentials;
    nodeError: (msg: string) => never;
    helpers: IExecuteFunctions['helpers'];
};
/**
 * Signature for an operation handler. Each handler must be an async function
 * that receives a `HandlerCtx` and returns any serializable value to be output
 * as node data.
 */
export type OperationHandler = (ctx: HandlerCtx) => Promise<unknown>;
/**
 * Registry mapping operation keys (selected in the node UI) to their concrete
 * handler implementation.
 */
export declare const operations: {
    createPaymentLink: OperationHandler;
    listReleaseReports: OperationHandler;
    configureReleaseReport: OperationHandler;
    editReleaseReportConfig: OperationHandler;
    getReleaseReportConfig: OperationHandler;
    downloadReleaseReport: OperationHandler;
    listSettlementReports: OperationHandler;
    downloadSettlementReport: OperationHandler;
    getSettlementReportConfig: OperationHandler;
    configureSettlementReport: OperationHandler;
    editSettlementReport: OperationHandler;
};
export type OperationName = keyof typeof operations;
export declare const isOperationName: (op: string) => op is OperationName;
