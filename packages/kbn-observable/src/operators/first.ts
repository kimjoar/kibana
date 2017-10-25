import { Observable } from '../Observable';
import { EmptyError } from '../errors';
import { MonoTypeOperatorFunction } from '../interfaces';

/**
 * Emits the first value emitted by the source Observable, then immediately
 * completes.
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
