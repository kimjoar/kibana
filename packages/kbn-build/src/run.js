import chalk from 'chalk';
import wrapAnsi from 'wrap-ansi';
import indentString from 'indent-string';

import { CliError } from './utils/errors';

export async function runCommand(command, commandOptions) {
  try {
    console.log(
      chalk.bold(
        `Running [${chalk.green(command.name)}] from [${chalk.yellow(
          commandOptions.rootPath
        )}]:\n`
      )
    );

    await command.run(commandOptions);
  } catch (e) {
    console.log(chalk.bold.red(`\n[${command.name}] failed:\n`));

    if (e instanceof CliError) {
      const msg = chalk.red(`CliError: ${e.message}\n`);
      console.log(wrapAnsi(msg, 80));

      const keys = Object.keys(e.meta);
      if (keys.length > 0) {
        const metaOutput = keys.map(key => {
          const value = e.meta[key];
          return `${key}: ${value}`;
        });

        console.log('Additional debugging info:\n');
        console.log(indentString(metaOutput.join('\n'), 3));
      }
    } else {
      console.log(e.stack);
    }

    process.exit(1);
  }
}