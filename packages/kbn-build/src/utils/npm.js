import path from 'path';
import writePkg from 'write-pkg';

import { spawn, spawnStreaming } from './childProcess';

export function runScriptInDir(script, args, directory) {
  return spawn('npm', ['run', script, ...args], {
    cwd: directory
  });
}

export function runScriptInPackageStreaming(script, args, pkg) {
  const execOpts = {
    cwd: pkg.path
  };

  const stream = spawnStreaming('npm', ['run', script, ...args], execOpts, {
    prefix: pkg.name
  });

  // TODO Add a timeout that triggers in case we're not able to see a
  // completion trigger.
  const started = new Promise(resolve => {
    stream.stdout.on('data', resolveOnStartup);

    function resolveOnStartup(data) {
      const isTypeScriptReady = data.includes('Compilation complete.');
      const isWebpackReady = data.includes('Chunk Names');

      if (isTypeScriptReady || isWebpackReady) {
        resolve();

        // When we've started up we no longer need to listen for changes
        stream.stdout.removeListener('data', resolveOnStartup);
      }
    }
  });

  return {
    started,
    stream
  };
}

export function installInDir(directory) {
  return spawn('yarn', ['install', '--non-interactive'], {
    cwd: directory
  });
}
