import { Observable, ObservableInput } from '../Observable';
import { OperatorFunction } from '../interfaces';
import { $from } from '../factories';

export function mergeMap<T, R>(
  project: (value: T, index: number) => ObservableInput<R>
): OperatorFunction<T, R>;
export function mergeMap<T, I, R>(
  project: (value: T, index: number) => ObservableInput<I>,
  resultSelector: (
    outerValue: T,
    innerValue: I,
    outerIndex: number,
    innerIndex: number
  ) => R
): OperatorFunction<T, R>;

/**
 * @param project A function that, when applied to an item emitted by the source
 * Observable, returns an Observable.
 * @param resultSelector A function to produce the value on the output
 * Observable based on the values and the indices of the source (outer) emission
 * and the inner Observable emission. The arguments passed to this function are:
 * 
 * - `outerValue`: the value that came from the source
 * - `innerValue`: the value that came from the projected Observable
 * - `outerIndex`: the "index" of the value that came from the source
 * - `innerIndex`: the "index" of the value from the projected Observable
 */
export function mergeMap<T, I, R>(
  project: (value: T, index: number) => ObservableInput<I>,
  resultSelector?: ((
    outerValue: T,
    innerValue: I,
    outerIndex: number,
    innerIndex: number
  ) => R)
): OperatorFunction<T, I | R> {
  return function mergeMapOperation(source) {
    return new Observable(destination => {
      let completed = false;
      let active = 0;
      let i = 0;

      source.subscribe({
        next(value) {
          const outerIndex = i;
          let result;
          try {
            result = project(value, i++);
          } catch (error) {
            destination.error(error);
            return;
          }
          active++;

          let innerIndex = 0;

          $from(result).subscribe({
            next(innerValue) {
              let result: R | I = innerValue;

              if (resultSelector !== undefined) {
                try {
                  result = resultSelector(
                    value,
                    innerValue,
                    outerIndex,
                    innerIndex
                  );
                } catch (err) {
                  destination.error(err);
                  return;
                }
                innerIndex++;
              }

              destination.next(result);
            },
            error(err) {
              destination.error(err);
            },
            complete() {
              active--;

              if (active === 0 && completed) {
                destination.complete();
              }
            }
          });
        },

        error(err) {
          destination.error(err);
        },

        complete() {
          completed = true;
          if (active === 0) {
            destination.complete();
          }
        }
      });
    });
  };
}
