import type { IRequestOptions } from 'n8n-workflow';
import type { IExecuteFunctions } from 'n8n-workflow';
import createPaymentLink from './createPaymentLink';
import listReleaseReports from './listReleaseReports';
import configureReleaseReport from './configureReleaseReport';
import editReleaseReportConfig from './editReleaseReportConfig';
import getReleaseReportConfig from './getReleaseReportConfig';
import downloadReleaseReport from './downloadReleaseReport';
import listSettlementReports from './listSettlementReports';
import downloadSettlementReport from './downloadSettlementReport';
import getSettlementReportConfig from './getSettlementReportConfig';
import configureSettlementReport from './configureSettlementReport';
import editSettlementReport from './editSettlementReport';

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
	request: (init: Omit<IRequestOptions, 'headers'> & { headers?: Record<string, string> }) => Promise<any>;
	credentials: { accessToken: string };
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
export const operations: Record<string, OperationHandler> = {
    createPaymentLink,
    listReleaseReports,
    configureReleaseReport,
    editReleaseReportConfig,
    getReleaseReportConfig,
    downloadReleaseReport,
    listSettlementReports,
    downloadSettlementReport,
    getSettlementReportConfig,
    configureSettlementReport,
    editSettlementReport,
};
