export interface MockCall {
	method: string;
	args: unknown[];
}

export interface MockGrammy {
	/** Records of all API calls made */
	calls: MockCall[];
	/** Pre-set return values by method name. Defaults to { ok: true } */
	setResponse(method: string, value: unknown): void;
	/** Clear all recorded calls */
	reset(): void;
	/** The bot-like object to pass into functions that take a bot */
	bot: MockBot;
}

/** Call any bot API method by name — avoids noUncheckedIndexedAccess on Record */
export type ApiCall = (method: string, ...args: unknown[]) => Promise<unknown>;

export interface MockBot {
	/** Typed proxy for direct property access (tests) */
	api: Record<string, (...args: unknown[]) => Promise<unknown>>;
	/** Explicit call helper for source files that can't use ! */
	call: ApiCall;
	token: string;
}

export function createMockGrammy(): MockGrammy {
	const calls: MockCall[] = [];
	const responses = new Map<string, unknown>();

	function invoke(method: string, args: unknown[]): Promise<unknown> {
		calls.push({ method, args });
		return Promise.resolve(responses.get(method) ?? { ok: true });
	}

	const api = new Proxy({} as Record<string, (...args: unknown[]) => Promise<unknown>>, {
		get(_target, method: string) {
			return (...args: unknown[]) => invoke(method, args);
		},
	});

	const call: ApiCall = (method, ...args) => invoke(method, args);

	return {
		calls,
		setResponse(method, value) {
			responses.set(method, value);
		},
		reset() {
			calls.length = 0;
			responses.clear();
		},
		bot: { api, call, token: 'mock:token' },
	};
}
