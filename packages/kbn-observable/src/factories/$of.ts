import { Observable } from '../Observable';
import { $fromIterable } from './$fromIterable';

/**
 * Create an Observable that emits each argument as a value.
 * @param items vararg items
 * @return
 */
export function $of<T>(...items: T[]): Observable<T> {
  return $fromIterable(items);
}
