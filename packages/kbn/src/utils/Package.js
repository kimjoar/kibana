import path from "path";
import semver from "semver";

import { runScriptInDir, installInDir } from "./npm";
import { readPackageJson } from "./packageJson";
import { CliError } from "./errors";

export class Package {
  static async fromPath(path) {
    const pkgJson = await readPackageJson(path);
    return new Package(pkgJson, path);
  }

  constructor(packageJson, packageDir) {
    this._json = packageJson;
    this.path = packageDir;

    this.packageJsonLocation = path.resolve(this.path, "package.json");
    this.nodeModulesLocation = path.resolve(this.path, "node_modules");
    this.targetLocation = path.resolve(this.path, "target");
  }

  get name() {
    return this._json.name;
  }

  get version() {
    return this._json.version;
  }

  get dependencies() {
    return this._json.dependencies || {};
  }

  get devDependencies() {
    return this._json.devDependencies || {};
  }

  get peerDependencies() {
    return this._json.peerDependencies || {};
  }

  get allDependencies() {
    return {
      ...this.devDependencies,
      ...this.dependencies
    };
  }

  get scripts() {
    return this._json.scripts || {};
  }

  // Which packages this package depends on
  get dependsOn() {
    return this._dependsOn || [];
  }

  ensureValidPackageVersion(pkg, version) {
    const relativePathToPkg = path.relative(this.path, pkg.path);
    const expectedVersion = `link:${relativePathToPkg}`;

    const meta = {
      package: `${this.name} (${this.packageJsonLocation})`,
      dependsOn: pkg.name,
      expectedVersion,
      actualVersion: version
    };

    if (version.startsWith("link:")) {
      if (version !== expectedVersion) {
        throw new CliError(
          `[${this.name}] depends on [${pkg.name}] using 'link:' but the location does not match.\nChange the actual version below to the expected version in the package.json.`,
          meta
        );
      }
    } else {
      throw new CliError(
        `[${this.name}] depends on [${pkg.name}], but it's not using the local package.\nChange the actual version below to the expected version in the package.json.`,
        meta
      );
    }
  }

  buildPackageGraph(packages) {
    const pkgs = [];
    const dependencies = this.allDependencies;

    for (const depName of Object.keys(dependencies)) {
      const depVersion = dependencies[depName];

      if (packages.has(depName)) {
        const pkg = packages.get(depName);

        this.ensureValidPackageVersion(pkg, depVersion);

        pkgs.push(pkg);
      }
    }

    this._dependsOn = pkgs;
  }

  hasScript(script) {
    return this.scripts.hasOwnProperty(script);
  }

  /**
   * Run a NPM script in this package's directory
   * @param {String} script NPM script to run
   */
  async runScript(script) {
    if (this.hasScript(script)) {
      await runScriptInDir(script, [], this.path);
    }
  }

  installDependencies() {
    return installInDir(this.path);
  }
}
