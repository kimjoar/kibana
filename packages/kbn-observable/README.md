# k$

Experiment to see how we might get some of the benefits of a library like RxJS
using nothing but the native `Observable` object which is proposed by
https://github.com/tc39/proposal-observable.

## Example:

```js
import { $from, k$, map, last } from 'kbn-observable';

// Calling $from will attempt to cast the input value
// to an observable:
// 
// - native observable: returns input value
// - non-native observable: wraps in a native observable
// - promise: observable that produces a single value or error
// - iterable (except strings): emits all items from iterable
// 
const observable = $from(1, 2, 3);

// The first argument to `k$` is the source observable, and the rest are
// "operators" that modify the input value and return an observable that
// reflects all of the modifications.
k$(observable)(map(i => 2017 + i), last())
  .subscribe(console.log) // logs 2020
```

## Factories

Just like the `k$` function, factories take arguments and produce an
observable.  Different factories are useful for different things, and many
behave just like the static functions attached to the Rx.Observable class in
RxJS.

See ./src/factories](./src/factories) for more info about each factory.

## Operators

Operators are functions that take some arguments and produce an operator
function. Operators aren't anything fancy, just a function that takes an
observable and returns a new observable with the requested modifications
applied.

Multiple operator functions can be passed as the second argument to `k$` and
will be applied to the input observable before returning the final observable
with all modifications applied.

See [./src/operators](./src/operators) for more info about each operator.

## Inspiration

This code is heavily inspired by and based on RxJS, which is licensed under the
Apache License, Version 2.0, see https://github.com/ReactiveX/rxjs.