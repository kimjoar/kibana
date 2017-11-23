import chalk from "chalk";

import {
  getPackages,
  ensureValidPackageNames,
  topologicallyBatchPackages
} from "./utils/packages";

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

  console.log(chalk.bold(`\n\nStarting up:\n`));

  let startedCount = 0;
  for (const batch of batchedPackages) {
    for (const pkg of batch) {
      if (pkg.hasScript("start")) {
        const { isStarted } = pkg.runScriptStreaming("start");
        await isStarted;
        startedCount++;
      }
    }
  }

  const kibana = packages.get("kibana");

  if (startedCount > 0) {
    kibana.runScriptStreaming("start");
  } else {
    kibana.runScript("start");
  }
}
