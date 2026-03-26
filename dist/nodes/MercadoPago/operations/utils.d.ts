import type { HandlerCtx } from './index';
export type ColumnValue = {
    keySource?: string;
    custom_key?: string;
    key?: string;
};
export type ColumnsParam = {
    columnsValues?: ColumnValue[];
};
export type FrequencyValues = {
    hour?: number;
    value?: number;
    type?: string;
};
export type FrequencyParam = {
    frequencyValues?: FrequencyValues;
};
export type ParsedFrequency = {
    hour: number;
    value: number;
    type: string;
};
export type SftpInfoValues = {
    server?: string;
    username?: string;
    password?: string;
    remote_dir?: string;
    port?: number;
};
export type EmailValue = {
    value?: string;
};
export type EmailListParam = {
    emails?: EmailValue[];
};
export declare const MAX_ITEMS_RETURN_ALL = 100000;
/**
 * Parses the columns collection from node UI into an array of { key: string }.
 * Supports both keySource/custom_key pattern and legacy key field.
 * Throws via ctx.nodeError if no valid columns are provided.
 */
export declare function parseColumns(ctx: HandlerCtx, paramName?: string): Array<{
    key: string;
}>;
/**
 * Parses the file_name_prefix parameter.
 * Throws via ctx.nodeError if empty.
 */
export declare function parseFileNamePrefix(ctx: HandlerCtx, paramName?: string): string;
/**
 * Parses the frequency collection from node UI.
 * Validates hour (0-23), value (> 0), and type (daily/weekly/monthly).
 * Throws via ctx.nodeError on validation failure.
 */
export declare function parseFrequency(ctx: HandlerCtx, paramName?: string): ParsedFrequency;
/**
 * Builds the sftp_info payload from the SFTP credential only.
 *
 * For password: no trim is applied (passwords may contain leading/trailing spaces).
 * Returns undefined when no credential is configured or all fields are empty.
 */
export declare function parseSftpInfo(ctx: HandlerCtx): SftpInfoValues | undefined;
/**
 * Parses an email list from a notification_email_list collection.
 * Returns an array of non-empty email strings.
 */
export declare function parseEmails(emailListParam: EmailListParam | undefined): string[];
/**
 * Extracts results array from API response.
 * Handles both direct array responses and { results: [...] } wrapped responses.
 */
export declare function extractResults(res: unknown): unknown[];
