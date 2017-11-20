# `kbn-build` — The Kibana build tool

`kbn-build` is a build tool inspired by Lerna, and it's is responsible for
bootstrapping, building and running Kibana.

This package is run from Kibana root, using `node scripts/kbn`.

## The `kbn` use-cases

### Bootstrapping

TODO: Describe

## Examples

Bootstrap all projects:

```
node scripts/kbn bootstrap
```

## Development

This package is run from Kibana root, using `node scripts/kbn`. This will run
the "pre-built" version of this tool, which is located in the `dist/` folder.

If you need to build a new version of this package, run `npm run build` in this
folder.

Even though this file is generated we commit it to Kibana, because it's used
_before_ dependencies are fetched (as this is the tool actually responsible for
fetching dependencies).

## Technical decisions

### Why our own tool?

TODO: Describe. yarn link vs npm file vs yarn workspaces vs lerna. What we need etc.
