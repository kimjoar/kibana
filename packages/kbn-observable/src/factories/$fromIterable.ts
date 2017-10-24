import { Observable } from '../Observable';

/**
 * Creates an Observable from an iterable value, like Arrays or Generators.
 *
 * @param {Iterable<T>}
 * @return {Observable<T>}
 */
export function $fromIterable<T>(iterable: Iterable<T>): Observable<T> {
  return new Observable(observer => {
    for (const value of iterable) {
      observer.next(value);

      if (observer.closed) {
        return;
      }
    }

    observer.complete();
  });
}
