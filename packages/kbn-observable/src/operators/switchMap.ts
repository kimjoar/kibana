import { Observable, Subscription } from '../Observable';
import { OperatorFunction } from '../interfaces';

/**
 * Projects each source value to an Observable which is merged in the output
 * Observable, emitting values only from the most recently projected Observable.
 * 
 * To understand how `switchMap` works, take a look at:
 * https://medium.com/@w.dave.w/becoming-more-reactive-with-rxjs-flatmap-and-switchmap-ccd3fb7b67fa
 */
export function switchMap<T, R>(
  project: (value: T, index: number) => Observable<R>
): OperatorFunction<T, R> {
  return function switchMapOperation(source) {
    return new Observable(destination => {
      let i = 0;
      let innerSubscription: Subscription | undefined = undefined;

      return source.subscribe({
        next(value) {
          let result;
          try {
            result = project(value, i++);
          } catch (error) {
            destination.error(error);
            return;
          }

          if (innerSubscription !== undefined) {
            innerSubscription.unsubscribe();
          }

          innerSubscription = result.subscribe({
            next(innerVal) {
              destination.next(innerVal);
            },
            error(err) {
              innerSubscription!.unsubscribe();
              destination.error(err);
            },
            complete() {
              innerSubscription!.unsubscribe();
            }
          });
        },
        error(err) {
          destination.error(err);
          innerSubscription = undefined;
        },
        complete() {
          destination.complete();
          innerSubscription = undefined;
        }
      });
    });
  };
}
