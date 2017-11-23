import path from "path";
import writePkg from "write-pkg";

import { spawn } from "./childProcess";

export async function runScriptInDir(script, args, directory) {
  const execOpts = {
    cwd: directory
  };

  await spawn("npm", ["run", script, ...args], execOpts);
}

export function installInDir(directory) {
  return execInstall(directory);
}

function execInstall(directory) {
  const cmd = "yarn";
  const args = ["install", "--non-interactive", "--ignore-scripts"];
  const opts = {
    cwd: directory
  };

  return spawn(cmd, args, opts);
}
