import { k$ } from '../../k$';
import { $of, $concat, $combineLatest } from '../../factories';
import { delay } from '../../operators';
import { collect } from '../../lib/collect';

test('emits once for each combination of items', async () => {
  const foo$ = $concat(
    k$($of(1))(delay(15)),
    k$($of(2))(delay(15)),
    k$($of(3))(delay(15))
  );

  const bar$ = $concat(
    k$($of('a'))(delay(10)),
    k$($of('b'))(delay(10)),
    k$($of('c'))(delay(10))
  );

  const observable = $combineLatest(foo$, bar$);
  const res = collect(observable);

  expect(await res).toEqual([
    [1, 'a'], // 15ms
    [1, 'b'], // 25ms
    [2, 'b'], // 30ms
    [2, 'c'], // 30ms
    [3, 'c'], // 45ms
    'C'
  ]);
});

test('only emits if every stream emits at least once', async () => {
  const empty$ = $of();
  const three$ = $of(1, 2, 3);

  const observable = $combineLatest(empty$, three$);
  const res = collect(observable);

  expect(await res).toEqual(['C']);
});
