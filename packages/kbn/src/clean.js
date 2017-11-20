import Listr from "listr";
import del from "del";

import {
  getPackages,
  getInvalidPackageNames,
  topologicallyBatchPackages,
  getDependenciesToInstall
} from "./utils/packages";
import { batchedTasks } from "./utils/tasks";

const tasks = new Listr([
  {
    title: "Find packages",
    task: async (ctx, task) => {
      const { config } = ctx;

      ctx.packages = await getPackages(config.rootPath, config.packagesPaths);
      task.title = `${task.title} (${ctx.packages.size} packages found)`;
    }
  },
  {
    title: "Cleaning up packages",
    task: async (ctx, task) => {
      const batchedPackages = topologicallyBatchPackages(ctx.packages);
      const tasks = batchedTasks(batchedPackages, pkg =>
        del([pkg.nodeModulesLocation, pkg.targetLocation], {
          // Because we have packages that live outside the root directory
          force: true
        })
      );

      return new Listr(tasks);
    }
  }
]);

export const name = "clean";
export const description =
  "Remove the node_modules and target directories from all packages.";

export async function run(config) {
  const rootPath = config.rootPath;
  const packagesPaths = config.packages;

  await tasks.run({
    config: { rootPath, packagesPaths }
  });
}
