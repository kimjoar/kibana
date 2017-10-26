import { last } from './last';
import { scan } from './scan';
import { ifEmpty } from './ifEmpty';
import { pipe } from '../lib';
import { OperatorFunction } from '../interfaces';

/**
 * Modify the source stream to apply a function to each value to produce a new
 * value, then only emit the final result of calling `fn(acc, item, i)`.
 * 
 * @param accumulator
 * @param initialValue
 */
export function reduce<T, R>(
  accumulator: (acc: R, value: T, index: number) => R,
  initialValue: R
): OperatorFunction<T, R> {
  return function reduceOperation(source) {
    return pipe(
      scan(accumulator, initialValue),
      ifEmpty(() => initialValue),
      last()
    )(source);
  };
}
