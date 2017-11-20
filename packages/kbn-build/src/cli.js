import { resolve } from 'path';
import getopts from 'getopts';
import dedent from 'dedent';
import chalk from 'chalk';

import * as commands from './commands';
import { runCommand } from './run';

function help() {
  const availableCommands = Object.keys(commands)
    .map(commandName => commands[commandName])
    .map(command => `${command.name} - ${command.description}`);

  console.log(dedent`
    usage: kbn <command> [<args>]

    By default commands are run for Kibana itself, all packages in the 'packages/'
    folder and for all plugins in ../kibana-extra.

    Available commands:

       ${availableCommands.join('\n       ')}

    Global options:

       --skip-kibana-extra  Filter all plugins in ../kibana-extra when running commands.
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

  const rootPath = process.cwd();

  const commandName = commandNames[0];
  const commandOptions = { options, rootPath };

  const command = commands[commandName];
  if (command === undefined) {
    console.log(
      chalk.red(`[${commandName}] is not a valid command, see 'kbn --help'`)
    );
    process.exit(1);
  }

  await runCommand(command, commandOptions);
}
