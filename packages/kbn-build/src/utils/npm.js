import { Observable } from 'rxjs';

import { spawn, spawnStreaming } from './childProcess';
import { streamToObservable } from './streamToObservable';

export function runScriptInDir(script, args, directory) {
  return spawn('yarn', ['run', script, ...args], {
    cwd: directory
  });
}

export function runScriptInPackageStreaming(script, args, pkg) {
  const execOpts = {
    cwd: pkg.path
  };

  const stream = spawnStreaming('yarn', ['run', script, ...args], execOpts, {
    prefix: pkg.name
  });

  return {
    initialBuildComplete: initialBuildComplete(stream),
    stream
  };
}

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

/**
 * Returns a promise that resolves when the "initial build" has completed. For
 * example when a TypeScript watch outputs the first "Compilation complete.".
 *
 * This enables us to run several watches in order, where a build depends on an
 * earlier build.
 *
 * There is no standardized solution for knowing when the initial build in a
 * watch has completed, so we need to look for some subset of the output to know
 * whether or not the build has completed.
 *
 * If the type of watch isn't handled specifically, this function treats a
 * certain timeout between stdouts as a sign that the initial build has
 * completed (see `maxTimeBetweenStdouts`).
 */
function initialBuildComplete(stream) {
  const stdout$ = streamToObservable(stream.stdout).map(buffer =>
    buffer.toString('utf-8')
  );

  const ts$ = stdout$.skipWhile(data => !data.includes('$ tsc'));
  const tsComplete$ = ts$.first(data => data.includes('Compilation complete.'));

  const webpack$ = stdout$.skipWhile(data => !data.includes('$ webpack'));
  const webpackComplete$ = webpack$.first(data => data.includes('Chunk Names'));

  const isHandled$ = Observable.race(ts$, webpack$).mapTo(true);
  const unhandledTypeComplete$ = timeoutIfUnhandled$(stdout$, isHandled$);

  return Observable.race(
    tsComplete$,
    webpackComplete$,
    unhandledTypeComplete$
  ).toPromise();
}

const noTypeFoundSymbol = Symbol('No type found');
const timeoutSymbol = Symbol('Timeout');

const isHandledTimeout = 1000;
const maxTimeBetweenStdouts = 2000;

function timeoutIfUnhandled$(stdout$, isHandled$) {
  const isHandledWithinTimeout$ = Observable.of(false).delay(isHandledTimeout);

  return Observable.race(isHandled$, isHandledWithinTimeout$)
    .filter(isHandled => !isHandled)
    .mergeMap(() =>
      stdout$
        .timeout(maxTimeBetweenStdouts)
        .catch(() => Observable.of(timeoutSymbol))
    );
}
