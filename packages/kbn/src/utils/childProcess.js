import execa from "execa";
import chalk from "chalk";
import logTransformer from "strong-log-transformer";

// Keep track of how many live children we have.
let children = 0;

// when streaming children are spawned, use this color for prefix
const colorWheel = ["cyan", "magenta", "blue", "yellow", "green", "red"];
const NUM_COLORS = colorWheel.length;

export function spawn(command, args, opts) {
  return execa(command, args, {
    ...opts,
    stdio: "inherit"
  });
}

function _spawn(command, args, opts) {
  children++;

  const res = execa(command, args, opts);

  res.then(
    val => {
      children--;
      return val;
    },
    err => {
      children--;
      throw err;
    }
  );

  return res;
}

export function spawnStreaming(command, args, opts, prefix) {
  const colorName = colorWheel[children % NUM_COLORS];
  const color = chalk[colorName];

  const spawned = _spawn(command, args, {
    ...opts,
    stdio: ["ignore", "pipe", "pipe"]
  });

  const prefixedStdout = logTransformer({ tag: `${color.bold(prefix)}:` });
  const prefixedStderr = logTransformer({
    tag: `${color(prefix)}:`,
    mergeMultiline: true
  });

  // Avoid "Possible EventEmitter memory leak detected" warning due to piped stdio
  if (children > process.stdout.listenerCount("close")) {
    process.stdout.setMaxListeners(children);
    process.stderr.setMaxListeners(children);
  }

  spawned.stdout.pipe(prefixedStdout).pipe(process.stdout);
  spawned.stderr.pipe(prefixedStderr).pipe(process.stderr);

  return spawned;
}
