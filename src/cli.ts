import { markNpmEntry } from './surface/cli_version.ts';
import { runTelegramCli } from './surface/telegram_cli_options.ts';

markNpmEntry();
process.exitCode = await runTelegramCli(process.argv.slice(2));
