import execa from "execa";

export function spawn(command, args, opts = {}) {
  return execa(command, args, {
    ...opts,
    stdio: "inherit"
  });
}
