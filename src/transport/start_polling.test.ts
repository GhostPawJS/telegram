import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Update } from 'grammy/types';
import type { PollingContext } from './start_polling.ts';
import { startPolling } from './start_polling.ts';
import type { BotInfo } from './types.ts';

const mockBotInfo: BotInfo = {
	id: 42,
	username: 'pollbot',
	firstName: 'Poll',
	isBot: true,
	canJoinGroups: true,
	canReadAllGroupMessages: false,
	supportsInlineQueries: false,
};

function makeUpdate(id: number): Update {
	return { update_id: id } as unknown as Update;
}

function makeCtx(overrides: Partial<PollingContext> & { signal?: AbortSignal }): PollingContext {
	const ac = new AbortController();
	return {
		getMe: async () => mockBotInfo,
		getUpdates: async (_offset, _timeout, _allowed) => [],
		onUpdate: async () => {},
		onError: () => {},
		signal: ac.signal,
		...overrides,
	};
}

describe('startPolling', () => {
	it('returns botInfo from getMe()', async () => {
		const ac = new AbortController();
		const ctx = makeCtx({
			signal: ac.signal,
			getUpdates: async () => {
				ac.abort();
				return [];
			},
		});
		const result = await startPolling(ctx);
		assert.deepEqual(result, mockBotInfo);
	});

	it('calls getUpdates with correct params', async () => {
		const ac = new AbortController();
		const calls: Array<{ offset: number; timeout: number; allowed: string[] }> = [];
		const ctx = makeCtx({
			signal: ac.signal,
			getUpdates: async (offset, timeout, allowed) => {
				calls.push({ offset, timeout, allowed });
				ac.abort();
				return [];
			},
		});
		await startPolling(ctx, { timeout: 10, allowedUpdates: ['message'] });
		// Give the loop a tick to fire
		await new Promise((r) => setTimeout(r, 5));
		const first = calls[0];
		assert.ok(first, 'expected at least one getUpdates call');
		assert.equal(first.offset, 0);
		assert.equal(first.timeout, 10);
		assert.deepEqual(first.allowed, ['message']);
	});

	it('processes updates in order and advances offset', async () => {
		const ac = new AbortController();
		const processed: number[] = [];
		let callCount = 0;
		const ctx = makeCtx({
			signal: ac.signal,
			getUpdates: async () => {
				callCount++;
				if (callCount === 1) return [makeUpdate(10), makeUpdate(11), makeUpdate(12)];
				ac.abort();
				return [];
			},
			onUpdate: async (u) => {
				processed.push(u.update_id);
			},
		});
		await startPolling(ctx);
		await new Promise((r) => setTimeout(r, 20));
		assert.deepEqual(processed, [10, 11, 12]);
	});

	it('stops when signal is aborted', async () => {
		const ac = new AbortController();
		let callCount = 0;
		const ctx = makeCtx({
			signal: ac.signal,
			getUpdates: async () => {
				callCount++;
				if (callCount >= 2) ac.abort();
				return [];
			},
		});
		await startPolling(ctx, { retryDelayMs: 0 });
		await new Promise((r) => setTimeout(r, 20));
		assert.ok(callCount <= 3, `expected loop to stop, but callCount=${callCount}`);
	});

	it('calls onError and retries on getUpdates failure', async () => {
		const ac = new AbortController();
		const errors: string[] = [];
		let callCount = 0;
		const ctx = makeCtx({
			signal: ac.signal,
			retryDelayMs: 0,
			getUpdates: async () => {
				callCount++;
				if (callCount === 1) throw new Error('network error');
				ac.abort();
				return [];
			},
			onError: (err: Error) => {
				errors.push(err.message);
			},
		} as unknown as Partial<PollingContext>);
		await startPolling(ctx, { retryDelayMs: 0 });
		await new Promise((r) => setTimeout(r, 30));
		assert.deepEqual(errors, ['network error']);
		assert.ok(callCount >= 2, 'expected retry after error');
	});

	it('handles empty updates array without advancing offset', async () => {
		const ac = new AbortController();
		const offsets: number[] = [];
		let callCount = 0;
		const ctx = makeCtx({
			signal: ac.signal,
			getUpdates: async (offset) => {
				offsets.push(offset);
				callCount++;
				if (callCount >= 2) ac.abort();
				return [];
			},
		});
		await startPolling(ctx);
		await new Promise((r) => setTimeout(r, 20));
		assert.ok(offsets.length >= 1);
		assert.ok(
			offsets.every((o) => o === 0),
			'offset should stay 0 with empty updates',
		);
	});
});
