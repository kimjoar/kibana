import { Observable } from '../Observable';
import { OperatorFunction } from '../interfaces';

/**
 * Modify a stream by calling `fn(acc, item, i)` for every item in the source
 * stream and emitting the return value of each invocation.
 * 
 * It's like {@link reduce}, but emits the current accumulation whenever the
 * source emits a value.
 * 
 * @param accumulator The accumulator function called on each source value.
 * @param initialValue The initial accumulation value.
 * @return An observable of the accumulated values.
 */
export function scan<T, R>(
  accumulator: (acc: R, value: T, index: number) => R,
  initialValue: R
): OperatorFunction<T, R> {
  return function scanOperation(source) {
    return new Observable(observer => {
      let i = -1;
      let acc = initialValue;

      return source.subscribe({
        next(value) {
          i += 1;

          try {
            acc = accumulator(acc, value, i);

            observer.next(acc);
          } catch (error) {
            observer.error(error);
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
