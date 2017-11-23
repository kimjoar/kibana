# `kbn-build` — The Kibana build tool

The Kibana build tool is responsible for bootstrapping, building and running Kibana.

## Playing around with this package

This package is run from Kibana root, using `node scripts/kbn`. This will run
the "pre-built" version of this tool, which is located in the `dist/` folder.

If you need to build a new version of this package, run `npm run build`.

Even though this file is generated, we commit it to Kibana, because it's used
_before_ dependencies are fetched (as it's the tool actually responsible for
fetching dependencies).

## The `kbn` use-cases

### Bootstrapping

TODO: Describe

### Running Kibana

TODO: Describe

## Why our own tool?

TODO: Describe. yarn link vs npm file vs yarn workspaces vs lerna. What we need etc.
