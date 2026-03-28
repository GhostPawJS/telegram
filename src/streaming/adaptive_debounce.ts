/**
 * Returns a debounce delay (ms) based on how long the stream has been running.
 * Starts at baseMs, doubles every doubleEveryMs up to maxMs.
 */
export function adaptiveDebounce(
	elapsedMs: number,
	baseMs = 300,
	maxMs = 3000,
	doubleEveryMs = 5000,
): number {
	const doublings = Math.floor(elapsedMs / doubleEveryMs);
	return Math.min(baseMs * 2 ** doublings, maxMs);
}
