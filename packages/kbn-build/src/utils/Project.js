import path from 'path';
import chalk from 'chalk';

import {
  runScriptInDir,
  runScriptInPackageStreaming,
  installInDir
} from './npm';
import { readPackageJson } from './packageJson';
import { CliError } from './errors';

const PREFIX = 'link:';

export class Project {
  static async fromPath(path) {
    const pkgJson = await readPackageJson(path);
    return new Project(pkgJson, path);
  }

  constructor(packageJson, projectPath) {
    this._json = packageJson;
    this.path = projectPath;

    this.packageJsonLocation = path.resolve(this.path, 'package.json');
    this.nodeModulesLocation = path.resolve(this.path, 'node_modules');
    this.targetLocation = path.resolve(this.path, 'target');

    this.allDependencies = {
      ...(this._json.devDependencies || {}),
      ...(this._json.dependencies || {})
    };
  }

  get name() {
    return this._json.name;
  }

  get version() {
    return this._json.version;
  }

  get scripts() {
    return this._json.scripts || {};
  }

  ensureValidProjectDependency(project) {
    const relativePathToProject = path.relative(this.path, project.path);

    const versionInPackageJson = this.allDependencies[project.name];
    const expectedVersionInPackageJson = `${PREFIX}${relativePathToProject}`;

    if (versionInPackageJson === expectedVersionInPackageJson) {
      return;
    }

    const updateMsg = 'Update its package.json to the expected value below.';
    const meta = {
      package: `${this.name} (${this.packageJsonLocation})`,
      expected: `"${project.name}": "${expectedVersionInPackageJson}"`,
      actual: `"${project.name}": "${versionInPackageJson}"`
    };

    if (versionInPackageJson.startsWith(PREFIX)) {
      throw new CliError(
        `[${this.name}] depends on [${project.name}] using '${
          PREFIX
        }', but the path is wrong. ${updateMsg}`,
        meta
      );
    }

    throw new CliError(
      `[${this.name}] depends on [${
        project.name
      }], but it's not using the local package. ${updateMsg}`,
      meta
    );
  }

  hasScript(script) {
    return this.scripts.hasOwnProperty(script);
  }

  /**
   * Run a NPM script in this package's directory
   * @param {String} script NPM script to run
   */
  async runScript(script) {
    console.log(
      chalk.bold(
        `\n\nRunning npm script [${chalk.yellow(script)}] in [${chalk.green(
          this.name
        )}]:`
      )
    );
    await runScriptInDir(script, [], this.path);
  }

  runScriptStreaming(script) {
    return runScriptInPackageStreaming(script, [], this);
  }

  hasDependencies() {
    return Object.keys(this.allDependencies).length > 0;
  }

  installDependencies() {
    console.log(
      chalk.bold(
        `\n\nInstalling dependencies in [${chalk.green(this.name)}]:\n`
      )
    );
    return installInDir(this.path);
  }
}
