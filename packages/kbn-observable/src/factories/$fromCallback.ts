import { Observable } from '../Observable';

/**
 * Creates an observable that calls the specified function with no arguments
 * when it is subscribed. The observerable will behave differently based on the
 * return value of the factory:
 *
 * - return `undefined`: observable will immediately complete
 * - otherwise: observable will emit the value and then complete
 *
 * @param {Function}
 * @returns {Observable}
 */
export function $fromCallback<T>(factory: () => T): Observable<T> {
  return new Observable(observer => {
    const result = factory();

    // empty stream
    if (result === undefined) {
      observer.complete();
      return;
    }

    // result is just a value
    observer.next(result as T);
    observer.complete();
  });
}
