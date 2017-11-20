import { resolve } from 'path';

/**
 * Returns all the paths where plugins are located
 */
export function getProjectPaths(rootPath, options) {
  const skipKibanaExtra = Boolean(options['skip-kibana-extra']);

  const projectPaths = [rootPath, resolve(rootPath, 'packages/*')];

  if (!skipKibanaExtra) {
    projectPaths.push(resolve(rootPath, '../kibana-extra/*'));
  }

  return projectPaths;
}
