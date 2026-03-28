import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createConnectionState, transitionState } from './connection_state.ts';
import type { BotInfo } from './types.ts';

const mockBotInfo: BotInfo = {
	id: 123,
	username: 'testbot',
	firstName: 'Test',
	isBot: true,
	canJoinGroups: true,
	canReadAllGroupMessages: false,
	supportsInlineQueries: false,
};

describe('createConnectionState', () => {
	it('returns idle state with null fields', () => {
		const state = createConnectionState();
		assert.equal(state.status, 'idle');
		assert.equal(state.mode, null);
		assert.equal(state.botInfo, null);
		assert.equal(state.startedAt, null);
		assert.equal(state.errorCount, 0);
		assert.equal(state.lastError, null);
	});
});

describe('transitionState', () => {
	it('transitions to starting with mode', () => {
		const state = createConnectionState();
		const next = transitionState(state, 'starting', { mode: 'polling' });
		assert.equal(next.status, 'starting');
		assert.equal(next.mode, 'polling');
		assert.equal(next.errorCount, 0);
		assert.equal(next.lastError, null);
	});

	it('transitions to running with botInfo and startedAt', () => {
		const state = transitionState(createConnectionState(), 'starting', { mode: 'polling' });
		const now = Date.now();
		const next = transitionState(state, 'running', { botInfo: mockBotInfo, startedAt: now });
		assert.equal(next.status, 'running');
		assert.deepEqual(next.botInfo, mockBotInfo);
		assert.equal(next.startedAt, now);
		assert.equal(next.mode, 'polling');
	});

	it('transitions to error, increments errorCount and sets lastError', () => {
		const state = createConnectionState();
		const next = transitionState(state, 'error', { error: 'network failure' });
		assert.equal(next.status, 'error');
		assert.equal(next.errorCount, 1);
		assert.equal(next.lastError, 'network failure');
	});

	it('transitions to stopped, clears lastError but preserves botInfo', () => {
		const state = transitionState(
			transitionState(createConnectionState(), 'running', { botInfo: mockBotInfo }),
			'error',
			{ error: 'oops' },
		);
		const next = transitionState(state, 'stopped');
		assert.equal(next.status, 'stopped');
		assert.equal(next.lastError, null);
		assert.deepEqual(next.botInfo, mockBotInfo);
	});

	it('accumulates errorCount across multiple errors', () => {
		let state = createConnectionState();
		state = transitionState(state, 'error', { error: 'err1' });
		state = transitionState(state, 'error', { error: 'err2' });
		state = transitionState(state, 'error', { error: 'err3' });
		assert.equal(state.errorCount, 3);
		assert.equal(state.lastError, 'err3');
	});
});
