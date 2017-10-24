import { Observable, ObservableInput } from '../Observable';
import { tryCoerce } from '../lib';

/**
 * Creates an observable that calls a factory function when it is subscribed.
 * The observerable will behave differently based on the return value of the
 * factory,
 *
 * - return `undefined`:
 *   observable will immediately complete
 * - return a value compatible with `$coerce()`:
 *   observerable will mirror the coerced value
 * - anything else:
 *   observable will emit the value and then complete
 *
 * @param {Function}
 * @returns {Observable}
 */
export function $fromFactory<T>(
  factory: () => T | ObservableInput<T>
): Observable<T> {
  return new Observable(observer => {
    const result = factory();

    // empty stream
    if (result === undefined) {
      observer.complete();
      return;
    }

    // TODO decide if this is needed or not

    // try to coerce the result into an observable
    const coerced = tryCoerce<T>(result);

    if (coerced !== undefined) {
      return coerced.subscribe(observer);
    }

    // result is just a value
    observer.next(result as T);
    observer.complete();
  });
}
