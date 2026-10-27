import { runTelegramCli } from './surface/telegram_cli_options.ts';

process.exitCode = await runTelegramCli(process.argv.slice(2));
