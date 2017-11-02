# `kbn-observable`

kbn-observable is an observable library based on the [proposed `Observable`][proposal]
feature. In includes several factory functions and operators, that all return
"native" observable. There is only one addition to the `Observable` class in
`kbn-observable` compared to the spec: a `pipe` method that works like the newly
added `pipe` method in [RxJS][rxjs], and which enables a simple and clean way to
apply operators to the observable.

Why build this? The main reason is that we don't want to tie our plugin apis
heavily to a large dependency, but rather expose something that's much closer
to "native" observables, and something we have control over ourselves. Also, all
other observable libraries have their own base `Observable` class, while we
wanted to rely on the proposed library.

In addition, `System.observable` enables interop between observable libraries,
which means plugins can use whatever observable library they want, if they don't
want to use `kbn-observable`.

## Example

```js
import { Observable, map, last } from 'kbn-observable';

const source = Observable.from(1, 2, 3);

source.pipe(map(i => 2017 + i), last())
  .subscribe(console.log) // logs 2020
```

## Just getting started with Observables?

TODO: Docs, videos, other intros. This needs to be good enough for people to
easily jump in and understand the basics of observables.

If you are just getting started with observables, a great place to start is with
Andre Staltz' [The introduction to Reactive Programming you've been missing][staltz-intro],
which is a great introduction to the ideas and concepts.

## Factories

Factories take arguments and produce an observable. Different factories are
useful for different things, and many behave just like the static functions
attached to the `Rx.Observable` class in RxJS.

See [./src/factories](./src/factories) for more info about each factory.

## Operators

Operators are functions that take some arguments and produce an operator
function. Operators aren't anything fancy, just a function that takes an
observable and returns a new observable with the requested modifications
applied.

Some examples:

```js
map(i => 2017 + i);

filter(i => i % 2 === 0)

reduce((acc, val) => {
  return acc + val;
}, 0);
```

Multiple operator functions can be passed to `pipe` and will be applied to the
input observable before returning the final observable with all modifications
applied, e.g. like the example above with `map` and `last`.

See [./src/operators](./src/operators) for more info about each operator.

## More advanced topics

TODO: Hot/cold. Multicasting.

## Inspiration

This code is heavily inspired by and based on [RxJS][rxjs], which is licensed
under the Apache License, Version 2.0.

## Technical decisions

### Why add the `pipe` method?

While exploring how to handle observables in Kibana we went through multiple
PoCs. We initially used RxJS directly, but we didn't find a simple way to
consistently transform RxJS observables into "native" observables in the plugin
apis. This was something we wanted because of our earlier experiences with
exposing large libraries in our apis, which causes problems e.g. when we need to
perform major upgrades of a lib that has breaking changes, but we can't ship a
new major version of Kibana yet, even though this will cause breaking changes
in our plugin apis.

Then we built the initial version of `kbn-observable` based on the Observable
spec, and we included a `k$` helper and several operators that worked like this:

```js
import { k$, Observable, map, first } from 'kbn-observable';

// general structure:
const resultObservable = k$(sourceObservable, [...operators]);

// e.g.
const source = Observable.from(1,2,3);
const observable = k$(source, [map(x => x + 1), first()]);
```

Here `Observable` would be a copy of the Observable class from the spec. This
would enable us to always work with these spec-ed observables. This worked
nicely in pure JavaScript, but caused a problem with TypeScript, as TypeScript
wasn't able to correctly type the operators array when more than one operator
was specified.

Because of that problem we tried `k$(source)(...operators)`. With this change
TypeScript is able to corretly type the operator arguments. However, this made
for a not so nice looking api. Also, it gives a feeling that you can do
`const obs = k$(source)`, then later do `obs(...operators)`, which was not an
intended use of the api.

In the end we decided to include a `pipe` helper on the observable instead, so
it becomes `source.pipe(...operators)`. It's a fairly small addition to the
`Observable` class, so it's easy to keep up-to-date. However, it's not the
simplest thing to codemod later on because Node.js streams also uses the `pipe`
keyword, so it's not an _ideal_ solution.

[proposal]: https://github.com/tc39/proposal-observable
[rxjs]: http://reactivex.io/rxjs/
[staltz-intro]: https://gist.github.com/staltz/868e7e9bc2a7b8c1f754
