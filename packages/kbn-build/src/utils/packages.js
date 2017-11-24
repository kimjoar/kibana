import _glob from 'glob';
import path from 'path';
import promisify from 'pify';

import { CliError } from './errors';
import { Package } from './Package';

const glob = promisify(_glob);

export async function getPackages(rootPath, packagesPaths) {
  const globOpts = {
    cwd: rootPath,
    strict: true,
    absolute: true
  };
  const packages = new Map();

  for (const globPath of packagesPaths) {
    const res = await glob(path.join(globPath, 'package.json'), globOpts);

    for (const globResult of res) {
      const packageConfigPath = normalize(globResult);
      const packageDir = path.dirname(packageConfigPath);
      const pkg = await Package.fromPath(packageDir);

      packages.set(pkg.name, pkg);
    }
  }

  return packages;
}

// https://github.com/isaacs/node-glob/blob/master/common.js#L104
// glob always returns "\\" as "/" in windows, so everyone
// gets normalized because we can't have nice things.
function normalize(dir) {
  return path.normalize(dir);
}

function buildPackageGraph(packages) {
  const packageGraph = new Map();

  for (const pkg of packages.values()) {
    const packageDeps = [];
    const dependencies = pkg.allDependencies;

    for (const depName of Object.keys(dependencies)) {
      const depVersion = dependencies[depName];

      if (packages.has(depName)) {
        const dep = packages.get(depName);

        pkg.ensureValidPackageVersion(dep, depVersion);

        packageDeps.push(dep);
      }
    }

    packageGraph.set(pkg.name, packageDeps);
  }

  return packageGraph;
}

export function topologicallyBatchPackages(packagesToBatch) {
  const packageGraph = buildPackageGraph(packagesToBatch);

  // We're going to be chopping stuff out of this array, so copy it.
  const packages = [...packagesToBatch.values()];

  // This maps package names to the number of packages that depend on them.
  // As packages are completed their names will be removed from this object.
  const refCounts = {};
  packages.forEach(pkg =>
    packageGraph.get(pkg.name).forEach(dep => {
      if (!refCounts[dep.name]) refCounts[dep.name] = 0;
      refCounts[dep.name]++;
    })
  );

  const batches = [];
  while (packages.length > 0) {
    // Get all packages that have no remaining dependencies within the repo
    // that haven't yet been picked.
    const batch = packages.filter(pkg => {
      const packageDeps = packageGraph.get(pkg.name);
      return packageDeps.filter(dep => refCounts[dep.name] > 0).length === 0;
    });

    // If we weren't able to find a package with no remaining dependencies,
    // then we've encountered a cycle in the dependency graph.
    const hasCycles = packages.length > 0 && batch.length === 0;
    if (hasCycles) {
      const cyclePackageNames = packages.map(p => p.name);
      const message =
        'Encountered a cycle in the dependency graph. Packages in cycle are:\n' +
        cyclePackageNames.join(', ');

      throw new CliError(message);
    }

    batches.push(batch);

    batch.forEach(pkg => {
      delete refCounts[pkg.name];
      packages.splice(packages.indexOf(pkg), 1);
    });
  }

  return batches;
}

/**
 * Making sure all packages have valid name. Currently, this only makes sure no
 * two packages have the same name.
 */
export function ensureValidPackageNames(packages) {
  const existingPackageNames = {};

  packages.forEach(pkg => {
    if (!existingPackageNames[pkg.name]) {
      existingPackageNames[pkg.name] = [];
    }

    existingPackageNames[pkg.name].push(pkg.path);
  });

  const names = Object.keys(existingPackageNames).filter(
    pkgName => existingPackageNames[pkgName].length > 1
  );

  if (names.length > 0) {
    throw new CliError(
      `Multiple packages with the same name: ${names.join(', ')}`
    );
  }
}
