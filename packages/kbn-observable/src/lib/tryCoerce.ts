import { Observable } from '../Observable';
import { $fromPromise, $fromIterable, $fromSubscribable } from '../factories';

const isFunction = (value: any) => typeof value === 'function';

export function tryCoerce<T>(value: any): Observable<T> | undefined {
  if (value == null || typeof value !== 'object') {
    return undefined;
  }

  if (value instanceof Observable) {
    return value;
  }

  if (isFunction(value[Symbol.observable])) {
    const observable = value[Symbol.observable]();
    return $fromSubscribable(observable);
  }

  if (isFunction(value[Symbol.iterator])) {
    return $fromIterable(value);
  }

  if (isFunction(value['then'])) {
    return $fromPromise(value);
  }

  return undefined;
}
