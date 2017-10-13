import { Observable as RxObservable } from 'rxjs';

import { Observable } from '../Observable';
import { MonoTypeOperatorFunction } from '../interfaces';
import { rxjsToEsObservable } from '../lib';

export function shareLast<T>(): MonoTypeOperatorFunction<T> {
  return function shareLastOperation(source: Observable<T>): Observable<T> {
    return rxjsToEsObservable(RxObservable.from(source).shareReplay(1));
  };
}
