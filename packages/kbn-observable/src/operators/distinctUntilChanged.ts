import { Observable } from '../Observable';
import { MonoTypeOperatorFunction } from '../interfaces';

const isStrictlyEqual = (a: any, b: any) => a === b;

/**
 * Returns an Observable that emits all items emitted by the source Observable
 * that are distinct by comparison from the previous item.
 * 
 * @param compare Comparison function called to test if an item is distinct from
 * the previous item in the source. Return `true` is distinct, `false`
 * otherwise. By default compares using `===`.
 * @return An Observable that emits items from the source Observable with
 * distinct values.
 */
export function distinctUntilChanged<T>(
  compare: (x: T, y: T) => boolean = isStrictlyEqual
): MonoTypeOperatorFunction<T> {
  return function distinctUntilChangedOperation(
    source: Observable<T>
  ): Observable<T> {
    return new Observable(observer => {
      let hasInitialValue = false;
      let currentValue: T;

      return source.subscribe({
        next(value) {
          if (!hasInitialValue) {
            hasInitialValue = true;
            currentValue = value;
            observer.next(value);
            return;
          }

          const isEqual = compare(currentValue, value);

          if (!isEqual) {
            observer.next(value);
            currentValue = value;
          }
        },
        error(error) {
          observer.error(error);
        },
        complete() {
          observer.complete();
        }
      });
    });
  };
}
