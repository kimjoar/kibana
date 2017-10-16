import { Observable } from '../Observable';
import { EmptyError } from '../errors';
import { MonoTypeOperatorFunction } from '../interfaces';

/**
 * Emits only the first value (or the first value that meets some condition)
 * emitted by the source Observable.
 */
export function first<T>(): MonoTypeOperatorFunction<T> {
  return function firstOperation(source) {
    return new Observable(observer => {
      let hasCompleted = false;

      return source.subscribe({
        next(value) {
          if (!hasCompleted) {
            observer.next(value);
            observer.complete();
          }
        },
        error(error) {
          observer.error(error);
        },
        complete() {
          if (!hasCompleted) {
            observer.error(new EmptyError('first()'));
          } else {
            observer.complete();
          }
        }
      });
    });
  };
}
