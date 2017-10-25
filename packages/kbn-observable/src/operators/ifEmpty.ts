import { Observable, Subscription } from '../Observable';
import { OperatorFunction } from '../interfaces';
import { $fromCallback } from '../factories';

/**
 * Modify a stream so that when the source completes without emiting any values
 * a new observable is created via `factory()` (see `$fromFactory`) that will be
 * mirrored to completion.
 * 
 * @param factory
 * @return
 */
export function ifEmpty<T, R>(factory: () => R): OperatorFunction<T, T | R> {
  return function ifEmptyOperation(source) {
    return new Observable(observer => {
      let empty = true;
      const subs: Subscription[] = [];

      subs.push(
        source.subscribe({
          next(value) {
            empty = false;
            observer.next(value);
          },
          error(error) {
            observer.error(error);
          },
          complete() {
            if (!empty) {
              observer.complete();
              return;
            }

            subs.push($fromCallback(factory).subscribe(observer));
          }
        })
      );

      return function() {
        subs.forEach(sub => sub.unsubscribe());
        subs.length = 0;
      };
    });
  };
}
