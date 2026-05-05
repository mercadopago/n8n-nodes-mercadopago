import { ICredentialType, INodeProperties } from 'n8n-workflow';
/**
 * MercadoPagoSftp Credential
 *
 * Stores SFTP connection details used by report-configuration operations
 * (Configure/Edit Release/Settlement Report) to deliver generated reports
 * via SFTP.
 *
 * This credential is **optional**. When configured, its values serve as the
 * base SFTP settings. Individual node parameters can still override any
 * field (e.g. via expressions), enabling a hybrid approach:
 *   - Credential: encrypted at rest by n8n (satisfies WebSec requirements).
 *   - Node params: support dynamic values from upstream workflow nodes.
 */
export declare class MercadoPagoSftp implements ICredentialType {
    name: string;
    displayName: string;
    documentationUrl: string;
    properties: INodeProperties[];
}
