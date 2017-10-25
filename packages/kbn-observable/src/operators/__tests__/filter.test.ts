import { Observable } from '../../Observable';
import { k$ } from '../../k$';
import { $from } from '../../factories';
import { filter, toArray, toPromise } from '../';

const number$ = $from([1, 2, 3]);
const collect = <T>(source: Observable<T>) =>
  k$(source)(toArray(), toPromise());

test('returns the filtered values', async () => {
  const numbers = await collect(k$(number$)(filter(n => n > 1)));

  expect(numbers).toEqual([2, 3]);
});

it('sends the index as arg 2', async () => {
  const numbers = await collect(k$(number$)(filter((n, i) => i > 1)));

  expect(numbers).toEqual([3]);
});
