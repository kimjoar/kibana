import { Observable } from '../Observable';
import { EmptyError } from '../errors';
import { MonoTypeOperatorFunction } from '../interfaces';

/**
 * Operator that drops all but the last event from its source observable.
 */
export function last<T>(): MonoTypeOperatorFunction<T> {
  return function lastOperation(source) {
    return new Observable(observer => {
      let hasReceivedValue = false;
      let latest: T;

      return source.subscribe({
        next(value) {
          hasReceivedValue = true;
          latest = value;
        },
        error(error) {
          observer.error(error);
        },
        complete() {
          if (hasReceivedValue) {
            observer.next(latest);
            observer.complete();
          } else {
            observer.error(new EmptyError('last()'));
          }
        }
      });
    });
  };
}
