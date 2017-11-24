import { resolve } from 'path';
import getopts from 'getopts';
import loadJsonFile from 'load-json-file';
import dedent from 'dedent';
import indentString from 'indent-string';
import wrapAnsi from 'wrap-ansi';
import chalk from 'chalk';

import * as commands from './commands';
import { CliError } from './utils/errors';

function help() {
  const availableCommands = Object.keys(commands)
    .map(commandName => commands[commandName])
    .map(command => `${command.name} - ${command.description}`);

  console.log(dedent`
    usage: kbn <command> [<args>]

    Available commands:

       ${availableCommands.join('\n       ')}
  `);
}

export async function run(argv) {
  const options = getopts(argv, {
    alias: {
      h: 'help'
    }
  });

  const commandNames = options._;
  const commandCount = commandNames.length;

  if (options.help || commandCount === 0) {
    help();
    return;
  }

  if (commandCount > 1) {
    console.log(`Only 1 command allowed at a time, ${commandCount} given.`);
    process.exit(1);
  }

  const cwd = process.cwd();
  const configFile = resolve(cwd, '.kbnconfig');

  let config;
  try {
    config = await loadJsonFile(configFile);
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.log(chalk.red(`Config file [${configFile}] was not found`));
    } else {
      console.log(chalk.red(`Reading config file [${configFile}] failed:\n`));
      console.log(e.stack);
    }
    process.exit(1);
  }

  const commandName = commandNames[0];
  const commandOptions = {
    ...config,
    rootPath: cwd
  };

  const command = commands[commandName];
  if (command === undefined) {
    console.log(
      chalk.red(`[${commandName}] is not a valid command, see 'kbn --help'`)
    );
    process.exit(1);
  }

  try {
    console.log(
      chalk.bold(
        `Running [${chalk.green(commandName)}] from [${chalk.yellow(
          commandOptions.rootPath
        )}]:\n`
      )
    );

    await command.run(commandOptions);
  } catch (e) {
    console.log(chalk.bold.red(`\n[${commandName}] failed:\n`));

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
