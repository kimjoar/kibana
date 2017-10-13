import { k$ } from '../../k$';
import { $of, $concat, $combineLatest } from '../../factories';
import { delay } from '../../operators';

test('emits once for each combination of items', done => {
  const foo$ = $concat(k$($of(3), delay(15)), k$($of(2), delay(15)));

  const bar$ = $concat(
    k$($of(1), delay(10)),
    k$($of(2), delay(10)),
    k$($of(3), delay(10))
  );

  const actual: any[] = [];

  $combineLatest(foo$, bar$).subscribe({
    next(val) {
      actual.push(val);
    },
    complete() {
      expect(actual).toEqual([[3, 1], [3, 2], [2, 2], [2, 3]]);
      done();
    }
  });
});

test('only emits if every stream emits at least once', () => {
  const empty$ = $of();
  const three$ = $of(1, 2, 3);

  const next = jest.fn();
  const complete = jest.fn();
  $combineLatest(empty$, three$).subscribe({
    next,
    complete
  });

  expect(next).not.toHaveBeenCalled();
  expect(complete).toHaveBeenCalledTimes(1);
});
