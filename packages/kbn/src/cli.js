import { resolve } from "path";
import getopts from "getopts";
import loadJsonFile from "load-json-file";
import readPkg from "read-pkg";
import dedent from "dedent";
import indentString from "indent-string";

import * as commands from "./";
import { CliError } from "./utils/errors";

function help(options) {
  const availableCommands = Object.keys(commands)
    .map(commandName => commands[commandName])
    .map(command => `${command.name} - ${command.description}`);

  console.log(dedent`
    usage: kbn <command> [<args>]

    Available commands:

        ${availableCommands.join("\n        ")}
  `);
}

export async function run(argv) {
  const options = getopts(argv, {
    alias: {
      h: "help",
      v: "version"
    }
  });

  const pkgJson = await readPkg(resolve(__dirname, "..", "package.json"));

  if (options.help) {
    help();
    return;
  }

  if (options.version) {
    console.log(pkgJson.version);
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

  if (config.version !== pkgJson.version) {
    if (config.version === undefined) {
      console.log(dedent`
        The config file does not contain a 'version' field. This field is required,
        and specifies the required version of 'kbn'.

           Config file: ${configFile}
           kbn version: ${pkgJson.version}
      `);
      return;
    }

    console.log(dedent`
      The 'version' field in the config does not match the version of 'kbn':

         Config file: ${configFile}
         Version in config: ${config.version}
         kbn version: ${pkgJson.version}

      The version in the config file must match the version of 'kbn'.

      If you temporarily need an older version of 'kbn', you can use 'npx' to
      run the required version, e.g.:

         npx kbn@${config.version} ${argv.join(' ')}

      However, if you want to install this version of 'kbn', run:

         yarn global add kbn@${config.version}
    `);
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
    await command.run(commandOptions);
  } catch (e) {
    if (e instanceof CliError) {
      console.error(`CliError: ${e.message}\n`);

      const keys = Object.keys(e.meta);
      if (keys.length > 0) {
        const metaOutput = keys.map(key => {
          const value = e.meta[key];
          return `${key}: ${value}`;
        });

        console.log(indentString(metaOutput.join("\n"), 3));
      }
    } else {
      console.error(e);
    }
  }
}
