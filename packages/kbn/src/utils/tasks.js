import Listr from "listr";

export function runScriptInPackages(batchedPackages, scriptName) {
  return batchedTasks(
    batchedPackages,
    pkg => pkg.runScript(scriptName),
    pkg => pkg.hasScript(scriptName)
  );
}

export function batchedTasks(batchedPackages, run, shouldRun = () => true) {
  let i = 1;
  const tasks = [];

  batchedPackages.forEach(batch => {
    const batchTasks = batch.filter(shouldRun).map(pkg => ({
      title: pkg.name,
      task: () => run(pkg)
    }));

    if (batchTasks.length === 0) {
      return;
    }

    tasks.push({
      title: `batch ${i++}`,
      task: () => {
        return new Listr(batchTasks, { concurrent: true });
      }
    });
  });

  return tasks;
}
