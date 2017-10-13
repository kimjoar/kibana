import { tryCoerce } from '../lib';
import { Observable, ObservableInput } from '../Observable';

/**
 *  Convert an input into an Observable based on the following rules:
 *
 *  if `input` is:
 *   - falsy : throw an error
 *   - not an object: throw an error
 *   - a Native Observable: return the value
 *   - `input[Symbol.observable]` is a function, see $fromSubscribable
 *   - `input[Symbol.iterator]` is a function, see $fromIterable
 *   - if `input` is a promise, see $fromPromise
 *
 *  @param {Observable|Subscribable|Iterator|Promise}
 *  @return {Observable}
 */
export function $from<T>(input: ObservableInput<T>): Observable<T> {
  const coerced = tryCoerce(input);

  if (coerced === undefined) {
    throw new TypeError(`${input} can't be coerced to an observable`);
  }

  return coerced;
}
