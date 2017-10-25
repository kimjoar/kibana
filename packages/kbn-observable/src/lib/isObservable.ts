import { Observable } from '../Observable';

export function isObservable<T>(x: any): x is Observable<T> {
  return x[Symbol.observable] !== undefined;
}
