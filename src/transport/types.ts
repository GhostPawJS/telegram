export interface PollingOpts {
	/** ms between poll loops on error, default 5000 */
	retryDelayMs?: number;
	/** allowed updates to receive, default all */
	allowedUpdates?: string[];
	/** timeout for long polling in seconds, default 30 */
	timeout?: number;
}

export interface WebhookOpts {
	/** URL for the webhook */
	url: string;
	/** Port to listen on, default 8443 */
	port?: number;
	/** TLS cert/key for HTTPS */
	tlsCert?: string;
	tlsKey?: string;
	/** Path for webhook endpoint, default '/webhook' */
	path?: string;
	/** Secret token header for verification */
	secretToken?: string;
}

export type StartOpts =
	| { mode: 'polling'; polling?: PollingOpts }
	| { mode: 'webhook'; webhook: WebhookOpts };

export interface BotInfo {
	id: number;
	username: string;
	firstName: string;
	isBot: true;
	canJoinGroups: boolean;
	canReadAllGroupMessages: boolean;
	supportsInlineQueries: boolean;
}

export type ConnectionStatus = 'idle' | 'starting' | 'running' | 'stopping' | 'stopped' | 'error';

export interface ConnectionState {
	status: ConnectionStatus;
	mode: 'polling' | 'webhook' | null;
	botInfo: BotInfo | null;
	startedAt: number | null;
	errorCount: number;
	lastError: string | null;
}
