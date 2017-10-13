import { Observable, ObservableInput } from '../Observable';
import { $fromPromise, $fromIterable, $fromSubscribable } from '../factories';

function hasMethod(value: any, name: symbol | string) {
  return value && typeof value[name] === 'function';
}

export function tryCoerce<T>(
  value: ObservableInput<T>
): Observable<T> | undefined {
  if (value == null || typeof value !== 'object') {
    return undefined;
  }

  if (value instanceof Observable) {
    return value;
  }

  if (hasMethod(value, Symbol.observable)) {
    return $fromSubscribable((value as any)[Symbol.observable]());
  }

  if (hasMethod(value, Symbol.iterator)) {
    return $fromIterable(value as any);
  }

  if (hasMethod(value, 'then')) {
    return $fromPromise(value as Promise<T>);
  }

  return undefined;
}
