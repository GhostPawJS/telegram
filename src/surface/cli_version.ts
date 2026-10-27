import { isSea } from 'node:sea';
import { telegramVersion } from '../version.ts';

let npmEntry = false;
export function markNpmEntry(): void {
	npmEntry = true;
}
export function cliVersion({
	args = [],
	sea = isSea,
	platform = process.platform,
	arch = process.arch,
	npm = npmEntry,
}: {
	args?: readonly string[];
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
	const target = `${platform === 'win32' ? 'windows' : platform}-${arch}`;
	if (args.includes('--json'))
		return JSON.stringify({
			name: 'telegram',
			version: telegramVersion,
			variant: binary ? 'binary' : npm ? 'npm' : 'library',
			target,
		});
	if (args.includes('--short')) return telegramVersion;
	const variant = binary ? `binary, ${target}` : npm ? 'npm' : 'library';
	return `telegram ${telegramVersion} (${variant})`;
}
