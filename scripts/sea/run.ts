import { runTelegramCli } from '../../src/surface/telegram_cli_options.ts';

export const run = (): Promise<void> =>
	runTelegramCli(process.argv.slice(2)).then(
		(code) => {
			process.exitCode = code;
		},
		(error: unknown) => {
			process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
			process.exitCode = 1;
		},
	);
