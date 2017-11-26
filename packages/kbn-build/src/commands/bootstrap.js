import chalk from 'chalk';

import { topologicallyBatchPackages } from '../utils/packages';

export const name = 'bootstrap';
export const description = 'Install dependencies and crosslink packages';

export async function run(packages) {
  const batchedPackages = topologicallyBatchPackages(packages);

  console.log(chalk.bold('\nRunning installs in topological order'));

  for (const batch of batchedPackages) {
    for (const pkg of batch) {
      await pkg.installDependencies();
    }
  }
}
