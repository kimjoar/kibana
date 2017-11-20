import { spawn } from './childProcess';

/**
 * Install all dependencies in the given directory
 */
export function installInDir(directory) {
  // We pass the mutex flag to ensure only one instance of yarn runs at any
  // given time (e.g. to avoid conflicts).
  return spawn('yarn', ['install', '--non-interactive', '--mutex file'], {
    cwd: directory
  });
}
