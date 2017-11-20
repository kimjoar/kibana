import execa from "execa";

export function exec(command, args, opts = {}) {
  return execa(command, args, {
    ...opts,
    stdio: "pipe"
  });
}
