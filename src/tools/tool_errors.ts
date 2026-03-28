import { TelegramError } from '../errors.ts';
import type { ToolFailure, ToolResult } from './tool_types.ts';
import { toolFailure } from './tool_types.ts';

/** Translates any thrown value into a ToolFailure. */
export function translateToolError(err: unknown): ToolFailure {
	if (err instanceof TelegramError) {
		const kind =
			err.code === 'TELEGRAM_VALIDATION'
				? 'domain'
				: err.code === 'TELEGRAM_NOT_FOUND'
					? 'domain'
					: err.code === 'TELEGRAM_API' || err.code === 'TELEGRAM_RATE_LIMIT'
						? 'protocol'
						: 'system';
		return toolFailure(kind, 'system_error', err.message, err.message);
	}
	const message = err instanceof Error ? err.message : String(err);
	return toolFailure('system', 'system_error', message, message);
}

/** Wraps a handler fn and catches errors into ToolFailure. */
export function withToolHandling<T>(fn: () => ToolResult<T>): ToolResult<T> {
	try {
		return fn();
	} catch (err) {
		return translateToolError(err);
	}
}
