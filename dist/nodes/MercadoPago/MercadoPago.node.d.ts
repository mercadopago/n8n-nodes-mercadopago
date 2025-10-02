import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
/**
 * n8n node: MercadoPago
 *
 * Exposes a set of operations grouped under two resources:
 * - `payments`: Create payment link (Checkout Preference).
 * - `reporting`: List, configure and download Release/Settlement reports.
 *
 * This class wires node UI properties to concrete operation handlers in
 * `./operations`, centralizes credential loading, and standardizes request
 * headers (Bearer auth + optional JSON). Errors are thrown using
 * `NodeOperationError` with item context.
 */
export declare class MercadoPago implements INodeType {
    description: INodeTypeDescription;
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
