import chalk from 'chalk';

import { topologicallyBatchProjects } from '../utils/projects';

export const name = 'start';
export const description = 'Start Kibana and watch projects';

export async function run(projects, projectGraph) {
  // Avoid "Possible EventEmitter memory leak detected" warning due to piped stdio
  process.stdout.setMaxListeners(projects.size);
  process.stderr.setMaxListeners(projects.size);

  // We know we want to start Kibana last, so this is just making _sure_ it's
  // actually the last project to start.
  const projectsLessKibana = new Map(projects);
  projectsLessKibana.delete('kibana');

  const batchedProjects = topologicallyBatchProjects(
    projectsLessKibana,
    projectGraph
  );
  let countProjectsWithWatch = 0;

  console.log(chalk.bold(`\n\nStarting up watches:\n`));

  for (const batch of batchedProjects) {
    const starting = [];

    for (const pkg of batch) {
      if (pkg.hasScript('watch')) {
        const execution = pkg.runScriptStreaming('watch');
        starting.push(execution.initialBuildComplete);
        countProjectsWithWatch++;
      }
    }

    // We need to make sure the entire batch has completed the startup process
    // before we can move on to the next batch
    await Promise.all(starting);
  }

  if (projects.has('kibana')) {
    const kibana = projects.get('kibana');

    if (countProjectsWithWatch > 0) {
      kibana.runScriptStreaming('start');
    } else {
      kibana.runScript('start');
    }
  }
}
