import Listr from "listr";

import {
  getPackages,
  ensureValidPackageNames,
  topologicallyBatchPackages,
  getDependenciesToInstall
} from "./utils/packages";
import { runScriptInPackages } from "./utils/tasks";

const tasks = new Listr([
  {
    title: "Find packages",
    task: async (ctx, task) => {
      const { config } = ctx;

      ctx.packages = await getPackages(config.rootPath, config.packagesPaths);
      ctx.batchedPackages = topologicallyBatchPackages(ctx.packages);
      task.title = `${task.title} (${ctx.packages.size} packages found)`;
    }
  },
  {
    title: "Verify package names",
    task: ctx => {
      ensureValidPackageNames(ctx.packages);
    }
  },
  {
    title: "Install dependencies",
    task: ctx => {
      const { packages } = ctx;
      const tasks = [];

      for (const pkg of packages.values()) {
        tasks.push({
          title: pkg.name,
          task: () => pkg.installDependencies()
        });
      }

      return new Listr(tasks, { concurrent: 4 });
    }
  },
  {
    title: "Prepare packages",
    task: ctx => {
      const { batchedPackages } = ctx;
      const tasks = runScriptInPackages(batchedPackages, "prepare");

      return new Listr(tasks);
    }
  }
]);

export const name = "bootstrap";
export const description = "Install dependencies and crosslink packages";

export async function run(config) {
  const rootPath = config.rootPath;
  const packagesPaths = config.packages;

  await tasks.run({
    config: { rootPath, packagesPaths }
  });
}
