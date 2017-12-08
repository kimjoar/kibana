import { resolve } from 'path';
import getopts from 'getopts';
import loadJsonFile from 'load-json-file';
import dedent from 'dedent';
import chalk from 'chalk';

import * as commands from './commands';
import { runCommand } from './run';
import { CliError } from './utils/errors';

function help() {
  const availableCommands = Object.keys(commands)
    .map(commandName => commands[commandName])
    .map(command => `${command.name} - ${command.description}`);

  console.log(dedent`
    usage: kbn <command> [<args>]

    Available commands:

       ${availableCommands.join('\n       ')}

    Global Options:

       --scope            Restricts the scope to package names matching the given
                          name. By default includes transitive dependencies. Scope
                          can be specified multiple times to specify multiple packages.
       --skip-transitive  Skip all transitive dependencies when 'scope' is passed.
       --skip-kibana      Kibana is included by default even if 'scope' is defined.
                          Pass this option to not include Kibana when running command.
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
    rootPath: cwd,
    scopes: toArray(options.scope),
    skipTransitive: Boolean(options['skip-transitive']),
    skipKibana: Boolean(options['skip-kibana'])
  };

  const command = commands[commandName];
  if (command === undefined) {
    console.log(
      chalk.red(`[${commandName}] is not a valid command, see 'kbn --help'`)
    );
    process.exit(1);
  }

  await runCommand(command, commandOptions);
}

function toArray(val) {
  if (val === undefined) {
    return [];
  }
  return [].concat(val);
}
