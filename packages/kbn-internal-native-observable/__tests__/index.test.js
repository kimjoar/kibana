import { Observable } from '../';

const first = () => source =>
  new Observable(observer =>
    source.subscribe({
      next(value) {
        observer.next(value);
        observer.complete();
      }
    })
  );

const plus = x => source =>
  new Observable(observer =>
    source.subscribe({
      next(value) {
        observer.next(value + x);
      },
      complete() {
        observer.complete();
      }
    })
  );

test('can pipe values', () => {
  const observable = Observable.of(1, 2, 3).pipe(plus(10), first());

  let value;
  observable.subscribe(x => {
    value = x;
  });

  expect(value).toEqual(11);
});
