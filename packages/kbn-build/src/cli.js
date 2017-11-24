import { resolve } from "path";
import getopts from "getopts";
import loadJsonFile from "load-json-file";
import dedent from "dedent";
import indentString from "indent-string";
import wrapAnsi from "wrap-ansi";
import chalk from "chalk";

import * as commands from "./commands";
import { CliError } from "./utils/errors";

function help(options) {
  const availableCommands = Object.keys(commands)
    .map(commandName => commands[commandName])
    .map(command => `${command.name} - ${command.description}`);

  console.log(dedent`
    usage: kbn <command> [<args>]

    Available commands:

       ${availableCommands.join("\n       ")}
  `);
}

export async function run(argv) {
  const options = getopts(argv, {
    alias: {
      h: "help"
    }
  });

  if (options.help) {
    help();
    return;
  }

  if (options._.length === 0) {
    help();
    return;
  }

  const cwd = process.cwd();
  const configFile = resolve(cwd, ".kbnconfig");

  let config;
  try {
    config = await loadJsonFile(configFile);
  } catch (e) {
    if (e.code === "ENOENT") {
      console.log(`Config file [${configFile}] was not found`);
    } else {
      console.log(`Reading config file [${configFile}] failed:`);
      console.log(e);
    }
    return;
  }

  const commandNames = options._;

  const count = commandNames.length;
  if (count > 1) {
    console.log(`Only 1 command allowed at a time, ${count} given.`);
    return;
  }

  const commandName = commandNames[0];
  const command = commands[commandName];
  const commandOptions = {
    ...config,
    rootPath: cwd
  };

  if (command === undefined) {
    console.log(`'${commandName}' is not a valid command, see 'kbn --help'`);
    return;
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
    if (e instanceof CliError) {
      console.error(wrapAnsi(`CliError: ${e.message}\n`, 80));

      const keys = Object.keys(e.meta);
      if (keys.length > 0) {
        const metaOutput = keys.map(key => {
          const value = e.meta[key];
          return `${key}: ${value}`;
        });

        console.log("Additional debugging info:\n");
        console.log(indentString(metaOutput.join("\n"), 3));
      }
    } else {
      console.error(e);
    }
  }
}
