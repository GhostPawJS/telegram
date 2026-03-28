import type { BotInfo, ConnectionState, ConnectionStatus } from './types.ts';

export function createConnectionState(): ConnectionState {
	return {
		status: 'idle',
		mode: null,
		botInfo: null,
		startedAt: null,
		errorCount: 0,
		lastError: null,
	};
}

export function transitionState(
	state: ConnectionState,
	to: ConnectionStatus,
	opts?: { botInfo?: BotInfo; error?: string; mode?: 'polling' | 'webhook'; startedAt?: number },
): ConnectionState {
	return {
		...state,
		status: to,
		mode: opts?.mode ?? state.mode,
		botInfo: opts?.botInfo ?? state.botInfo,
		startedAt: opts?.startedAt ?? state.startedAt,
		errorCount: to === 'error' ? state.errorCount + 1 : state.errorCount,
		lastError: opts?.error ?? (to === 'error' ? state.lastError : null),
	};
}
