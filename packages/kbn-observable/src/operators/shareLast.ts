import { Observable as RxObservable } from 'rxjs';

import { MonoTypeOperatorFunction } from '../interfaces';
import { rxjsToEsObservable } from '../lib';

export function shareLast<T>(): MonoTypeOperatorFunction<T> {
  return function shareLastOperation(source) {
    return rxjsToEsObservable(RxObservable.from(source).shareReplay(1));
  };
}
