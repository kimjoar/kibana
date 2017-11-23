import path from "path";
import writePkg from "write-pkg";

import { spawn, spawnStreaming } from "./childProcess";

export async function runScriptInDir(script, args, directory) {
  const execOpts = {
    cwd: directory
  };

  await spawn("npm", ["run", script, ...args], execOpts);
}

export function runScriptInPackageStreaming(script, args, pkg) {
  const execOpts = {
    cwd: pkg.path
  };

  const stream = spawnStreaming(
    "npm",
    ["run", script, ...args],
    execOpts,
    pkg.name
  );

  // TODO Add a timeout that triggers in case we're not able to see a
  // completion trigger.
  const isStarted = new Promise(resolve => {
    stream.stdout.on("data", resolveOnStartup);

    function resolveOnStartup(data) {
      const isTypeScriptReady = data.includes("Compilation complete.");
      const isWebpackReady = data.includes("Chunk Names");

      if (isTypeScriptReady || isWebpackReady) {
        resolve();

        // When we've started up we no longer need to listen for changes
        stream.stdout.removeListener("data", resolveOnStartup);
      }
    }
  });

  return {
    isStarted,
    stream
  };
}

export function installInDir(directory) {
  return execInstall(directory);
}

function execInstall(directory) {
  const cmd = "yarn";
  const args = ["install", "--non-interactive"];
  const opts = {
    cwd: directory
  };

  return spawn(cmd, args, opts);
}
