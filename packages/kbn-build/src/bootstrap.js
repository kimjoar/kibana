import chalk from "chalk";

import {
  getPackages,
  ensureValidPackageNames,
  topologicallyBatchPackages
} from "./utils/packages";

export const name = "bootstrap";
export const description = "Install dependencies and crosslink packages";

export async function run(config) {
  const rootPath = config.rootPath;
  const packagesPaths = config.packages;

  const packages = await getPackages(rootPath, packagesPaths);

  console.log(chalk.bold(`Found [${chalk.green(packages.size)}] packages:\n`));
  for (const pkg of packages.values()) {
    console.log(`- ${pkg.name} (${pkg.path})`);
  }

  ensureValidPackageNames(packages);
  const batchedPackages = topologicallyBatchPackages(packages);

  console.log("Running installs in topological order");

  for (const batch of batchedPackages) {
    for (const pkg of batch) {
      await pkg.installDependencies();
    }
  }
}
