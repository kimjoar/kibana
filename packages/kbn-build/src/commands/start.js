import chalk from "chalk";

import {
  getPackages,
  ensureValidPackageNames,
  topologicallyBatchPackages
} from "../utils/packages";

export const name = "start";
export const description = "Start Kibana and watch packages";

export async function run(config) {
  const rootPath = config.rootPath;
  const packagesPaths = config.packages;

  const packages = await getPackages(rootPath, packagesPaths);

  console.log(chalk.bold(`Found [${chalk.green(packages.size)}] packages:\n`));
  for (const pkg of packages.values()) {
    console.log(`- ${pkg.name} (${pkg.path})`);
  }

  // We know we want to start Kibana last, so this is just making _sure_ it's
  // actually the last package to start.
  const packagesLessKibana = new Map(packages);
  packagesLessKibana.delete("kibana");

  const batchedPackages = topologicallyBatchPackages(packagesLessKibana);
  let countPackagesWithWatch = 0;

  console.log(chalk.bold(`\n\nStarting up:\n`));

  for (const batch of batchedPackages) {
    const starting = [];

    for (const pkg of batch) {
      const stream = pkg.runScriptStreaming("start");

      if (stream !== undefined) {
        starting.push(stream.started);
        countPackagesWithWatch++;
      }
    }

    // We need to make sure the entire batch has completed the startup process
    // before we can move on to the next batch
    await Promise.all(starting);
  }

  const kibana = packages.get("kibana");

  if (countPackagesWithWatch.length > 0) {
    kibana.runScriptStreaming("start");
  } else {
    kibana.runScript("start");
  }
}
