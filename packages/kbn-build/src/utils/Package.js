import path from 'path';
import chalk from 'chalk';

import {
  runScriptInDir,
  runScriptInPackageStreaming,
  installInDir
} from './npm';
import { readPackageJson } from './packageJson';
import { CliError } from './errors';

export class Package {
  static async fromPath(path) {
    const pkgJson = await readPackageJson(path);
    return new Package(pkgJson, path);
  }

  constructor(packageJson, packageDir) {
    this._json = packageJson;
    this.path = packageDir;

    this.packageJsonLocation = path.resolve(this.path, 'package.json');
    this.nodeModulesLocation = path.resolve(this.path, 'node_modules');
    this.targetLocation = path.resolve(this.path, 'target');
  }

  get name() {
    return this._json.name;
  }

  get version() {
    return this._json.version;
  }

  getAllDependencies() {
    return {
      ...(this._json.devDependencies || {}),
      ...(this._json.dependencies || {})
    };
  }

  get scripts() {
    return this._json.scripts || {};
  }

  ensureValidPackageVersion(pkg, version) {
    const relativePathToPkg = path.relative(this.path, pkg.path);
    const expectedVersion = `link:${relativePathToPkg}`;

    if (version.startsWith('link:') && version === expectedVersion) {
      return;
    }

    const updateMsg = 'Update its package.json to the expected value below.';
    const meta = {
      package: `${this.name} (${this.packageJsonLocation})`,
      expected: `"${pkg.name}": "${expectedVersion}"`,
      actual: `"${pkg.name}": "${version}"`
    };

    if (version.startsWith('link:')) {
      throw new CliError(
        `[${this.name}] depends on [${
          pkg.name
        }] using 'link:', but the path is wrong. ${updateMsg}`,
        meta
      );
    }

    throw new CliError(
      `[${this.name}] depends on [${
        pkg.name
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

  installDependencies() {
    console.log(
      chalk.bold(
        `\n\nInstalling dependencies in [${chalk.green(this.name)}]:\n`
      )
    );
    return installInDir(this.path);
  }
}
