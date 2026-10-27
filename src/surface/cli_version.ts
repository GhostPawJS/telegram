import { isSea } from 'node:sea';
import { telegramVersion } from '../version.ts';

let npmEntry = false;
export function markNpmEntry(): void {
	npmEntry = true;
}
export function cliVersion({
	sea = isSea,
	platform = process.platform,
	arch = process.arch,
	npm = npmEntry,
}: {
	sea?: () => boolean;
	platform?: string;
	arch?: string;
	npm?: boolean;
} = {}): string {
	let binary = false;
	try {
		binary = sea();
	} catch {
		/* Runtime detection can be unavailable. */
	}
	const variant = binary
		? `binary, ${platform === 'win32' ? 'windows' : platform}-${arch}`
		: npm
			? 'npm'
			: 'library';
	return `telegram ${telegramVersion} (${variant})`;
}
