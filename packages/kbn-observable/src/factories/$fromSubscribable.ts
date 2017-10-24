import { Observable, Subscribable } from '../Observable';

/**
 * If the input Observable is already a native observable it is returned,
 * otherwise a new Observable is created that will mirror the input by calling
 * it's subscribe() function.
 *
 * @param {Subscribable<T>}
 * @return {Observable<T>}
 */
export function $fromSubscribable<T>(
  observable: Subscribable<T>
): Observable<T> {
  if (observable.constructor === Observable) {
    return observable as Observable<T>;
  }

  return new Observable(observer => observable.subscribe(observer));
}
