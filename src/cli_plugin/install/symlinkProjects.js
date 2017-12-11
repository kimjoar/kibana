import path from 'path';
import mkdirp from 'mkdirp';

import * as fs from '../lib/fs';

const PREFIX = 'link:';

export async function symlinkProjects(settings, logger) {
  // In development this package lives in `../kibana-extra/{plugin}`
  // relative to Kibana, however in production it will live in the plugins
  // folder, so we need to update the location of Kibana.
  const replaceTopLevelKibanaPath = path =>
    path.replace('../../kibana', settings.kibanaPath);

  await symlinkDependencies(
    settings.workingPath,
    replaceTopLevelKibanaPath,
    logger
  );
}

async function symlinkDependencies(pluginPath, replaceKibanaPath, logger) {
  const nodeModulesPath = path.resolve(pluginPath, 'node_modules');
  const packageJsonPath = path.resolve(pluginPath, 'package.json');

  const rawPkgJson = await fs.readFile(packageJsonPath, 'utf-8');
  const pkgJson = JSON.parse(rawPkgJson);

  const deps = pkgJson.dependencies || {};

  for (const depName of Object.keys(deps)) {
    const depVersion = deps[depName];

    if (depVersion.startsWith(PREFIX)) {
      let pathToDependency = depVersion.slice(PREFIX.length);

      pathToDependency = replaceKibanaPath(pathToDependency);

      // to find the source, we need to resolve the location, given the current
      // working path.
      pathToDependency = path.resolve(pluginPath, pathToDependency);

      logger.log(
        `Symlinking dependency [${depName}] to [${pathToDependency}]`
      );

      if (!await fs.exists(pathToDependency)) {
        throw new Error(`Preparing to symlink [${depName}], but source [${pathToDependency}] does not exist`);
      }

      const dest = path.join(nodeModulesPath, depName);

      await mkdirp(path.dirname(dest));

      await symlink(pathToDependency, dest);
    }
  }
}

function symlink(src, dest) {
  if (process.platform === 'win32') {
    return createWindowsSymlink(src, dest);
  }

  return createPosixSymlink(src, dest);
}

function createPosixSymlink(origin, dest) {
  const src = path.relative(path.dirname(dest), origin);
  return createSymbolicLink(src, dest);
}

function createWindowsSymlink(src, dest) {
  return createSymbolicLink(src, dest);
}

async function createSymbolicLink(src, dest) {
  if (await fs.exists(dest)) {
    // Something exists at `dest`. Need to remove it first.
    await fs.unlink(dest);
  }

  await fs.symlink(src, dest, 'junction');
}
