import chalk from 'chalk';

import { getPackages, topologicallyBatchPackages } from '../utils/packages';

export const name = 'start';
export const description = 'Start Kibana and watch packages';

export async function run(packages) {
  // Avoid "Possible EventEmitter memory leak detected" warning due to piped stdio
  process.stdout.setMaxListeners(packages.size);
  process.stderr.setMaxListeners(packages.size);

  // We know we want to start Kibana last, so this is just making _sure_ it's
  // actually the last package to start.
  const packagesLessKibana = new Map(packages);
  packagesLessKibana.delete('kibana');

  const batchedPackages = topologicallyBatchPackages(packagesLessKibana);
  let countPackagesWithWatch = 0;

  console.log(chalk.bold(`\n\nStarting up:\n`));

  for (const batch of batchedPackages) {
    const starting = [];

    for (const pkg of batch) {
      if (pkg.hasScript('start')) {
        const stream = pkg.runScriptStreaming('start');
        starting.push(stream.started);
        countPackagesWithWatch++;
      }
    }

    // We need to make sure the entire batch has completed the startup process
    // before we can move on to the next batch
    await Promise.all(starting);
  }

  const kibana = packages.get('kibana');

  if (countPackagesWithWatch > 0) {
    kibana.runScriptStreaming('start');
  } else {
    kibana.runScript('start');
  }
}
