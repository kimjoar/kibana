import del from 'del';
import chalk from 'chalk';
import { relative } from 'path';
import ora from 'ora';

import { isDirectory } from '../utils/fs';

export const name = 'clean';
export const description =
  'Remove the node_modules and target directories from all packages.';

export async function run(packages, { rootPath }) {
  const directoriesToDelete = [];
  for (const pkg of packages.values()) {
    if (await isDirectory(pkg.nodeModulesLocation)) {
      directoriesToDelete.push(pkg.nodeModulesLocation);
    }

    if (await isDirectory(pkg.targetLocation)) {
      directoriesToDelete.push(pkg.targetLocation);
    }
  }

  if (directoriesToDelete.length === 0) {
    console.log(chalk.bold.green('\n\nNo directories to delete'));
  } else {
    console.log(chalk.bold.red('\n\nDeleting folders:\n'));

    for (const dir of directoriesToDelete) {
      const deleting = del(dir, { force: true });
      ora.promise(deleting, relative(rootPath, dir));
      await deleting;
    }
  }
}
