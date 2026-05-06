import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

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
export class MercadoPagoSftp implements ICredentialType {
	name = 'mercadoPagoSftp';
	displayName = 'MercadoPago SFTP';
	documentationUrl = 'https://www.mercadopago.com.br/developers/en/reference';
	properties: INodeProperties[] = [
		{
			displayName: 'Server',
			name: 'server',
			type: 'string',
			default: '',
			description: 'SFTP server hostname or IP address',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			description: 'SFTP username for authentication',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'SFTP password (encrypted at rest by n8n)',
		},
		{
			displayName: 'Remote Dir',
			name: 'remote_dir',
			type: 'string',
			default: '',
			description: 'Remote directory path for report delivery',
		},
		{
			displayName: 'Port',
			name: 'port',
			type: 'number',
			default: 22,
			description: 'SFTP port number',
		},
	];
}
