import del from 'del';
import chalk from 'chalk';
import { relative } from 'path';
import ora from 'ora';

import { isDirectory } from '../utils/fs';

export const name = 'clean';
export const description =
  'Remove the node_modules and target directories from all projects.';

export async function run(projects, projectGraph, { rootPath }) {
  const directoriesToDelete = [];
  for (const project of projects.values()) {
    if (await isDirectory(project.nodeModulesLocation)) {
      directoriesToDelete.push(project.nodeModulesLocation);
    }

    if (await isDirectory(project.targetLocation)) {
      directoriesToDelete.push(project.targetLocation);
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
