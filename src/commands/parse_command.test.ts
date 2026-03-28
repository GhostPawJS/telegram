import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseCommand } from './parse_command.ts';

describe('parseCommand', () => {
	it('parses a simple command with no args', () => {
		const result = parseCommand('/start');
		assert.deepEqual(result, { command: 'start', args: [], rawText: '/start' });
	});

	it('parses a command with args', () => {
		const result = parseCommand('/start hello world');
		assert.deepEqual(result, {
			command: 'start',
			args: ['hello', 'world'],
			rawText: '/start hello world',
		});
	});

	it('lowercases the command', () => {
		const result = parseCommand('/START');
		assert.ok(result);
		assert.equal(result.command, 'start');
	});

	it('matches /help@mybot when botUsername is mybot', () => {
		const result = parseCommand('/help@mybot', 'mybot');
		assert.ok(result);
		assert.equal(result.command, 'help');
	});

	it('returns null for /help@otherbot when botUsername is mybot', () => {
		const result = parseCommand('/help@otherbot', 'mybot');
		assert.equal(result, null);
	});

	it('matches /help@mybot when no botUsername provided', () => {
		const result = parseCommand('/help@mybot');
		assert.ok(result);
		assert.equal(result.command, 'help');
	});

	it('returns null for non-command text', () => {
		const result = parseCommand('not a command');
		assert.equal(result, null);
	});

	it('returns null for empty string', () => {
		const result = parseCommand('');
		assert.equal(result, null);
	});

	it('returns null for lone slash', () => {
		const result = parseCommand('/');
		assert.equal(result, null);
	});

	it('properly splits args with multiple spaces', () => {
		const result = parseCommand('/cmd  extra  spaces');
		assert.ok(result);
		assert.deepEqual(result.args, ['extra', 'spaces']);
	});

	it('is case-insensitive for botUsername matching', () => {
		const result = parseCommand('/start@MyBot', 'mybot');
		assert.ok(result);
		assert.equal(result.command, 'start');
	});
});
