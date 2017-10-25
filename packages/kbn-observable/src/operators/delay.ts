import { Observable } from '../Observable';
import { MonoTypeOperatorFunction } from '../interfaces';

/**
 * Operator that applies a delay of `ms` to each item of source observable
 * before mirroring them. Errors are not delayed, but complete will be delayed
 * until all values have been mirrored.
 * 
 * @param ms Number of milliseconds to delay
 * @return
 */
export function delay<T>(ms: number): MonoTypeOperatorFunction<T> {
  return function delayOperation(source) {
    return new Observable(observer => {
      const pending = new Set();

      const sub = source.subscribe({
        next(value) {
          const timer = setTimeout(() => {
            pending.delete(timer);
            observer.next(value);

            if (sub.closed && !pending.size) {
              observer.complete();
            }
          }, ms);

          pending.add(timer);
        },

        error(error) {
          observer.error(error);
        },

        complete() {
          if (!pending.size) {
            observer.complete();
          }
        }
      });

      return function() {
        sub.unsubscribe();
        pending.forEach(timer => clearTimeout(timer));
        pending.clear();
      };
    });
  };
}
