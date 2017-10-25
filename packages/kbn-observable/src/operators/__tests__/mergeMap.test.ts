import { Observable } from '../../Observable';
import { k$ } from '../../k$';
import { Subject } from '../../Subject';
import { mergeMap, delay } from '../';
import { $of, $concat, $error } from '../../factories';
import { collect } from '../../lib/collect';

it('should mergeMap many outer values to many inner values', async () => {
  const source = Observable.from([1, 2, 3, 4]);
  const project = (value: number, index: number) =>
    $concat(
      k$($of(`${value}-a`))(delay(20)),
      k$($of(`${value}-b`))(delay(40)),
      k$($of(`${value}-c`))(delay(60))
    );

  const observable = k$(source)(mergeMap(project));

  const res = collect(observable);
  expect(await res).toEqual([
    '1-a',
    '2-a',
    '3-a',
    '4-a',
    '1-b',
    '2-b',
    '3-b',
    '4-b',
    '1-c',
    '2-c',
    '3-c',
    '4-c',
    'C'
  ]);
});

it('should mergeMap many outer values to many inner values, early complete', async () => {
  const source = new Subject();
  const project = (value: number, index: number) =>
    $concat(
      k$($of(`${value}-a`))(delay(20)),
      k$($of(`${value}-b`))(delay(40)),
      k$($of(`${value}-c`))(delay(60))
    );

  const observable = k$(source)(mergeMap(project));
  const res = collect(observable);

  source.next(1);
  source.next(2);
  source.complete();

  // This shouldn't end up in the results
  source.next(3);

  expect(await res).toEqual(['1-a', '2-a', '1-b', '2-b', '1-c', '2-c', 'C']);
});

it('should mergeMap many outer to many inner, and inner throws', async () => {
  const source = Observable.from([1, 2, 3, 4]);
  const error = new Error('fail');

  const project = (value: number, index: number) =>
    index > 1 ? $error(error) : $of(value);

  const observable = k$(source)(mergeMap(project));
  const res = collect(observable);

  expect(await res).toEqual([1, 2, error]);
});

it('should mergeMap many outer to many inner, and outer throws', async () => {
  const source = new Subject();
  const project = (value: number, index: number) =>
    $concat(
      k$($of(`${value}-a`))(delay(20)),
      k$($of(`${value}-b`))(delay(40)),
      k$($of(`${value}-c`))(delay(60))
    );

  const observable = k$(source)(mergeMap(project));
  const res = collect(observable);

  source.next(1);
  source.next(2);

  const error = new Error('outer fails');
  setTimeout(() => {
    source.error(error);
    // This shouldn't end up in the results
    source.next(3);
  }, 70);

  expect(await res).toEqual(['1-a', '2-a', '1-b', '2-b', error]);
});

it('should mergeMap many outer to an array for each value', async () => {
  const source = Observable.from([1, 2, 3]);

  const observable = k$(source)(mergeMap(() => $of('a', 'b', 'c')));
  const res = collect(observable);

  expect(await res).toEqual(['a', 'b', 'c', 'a', 'b', 'c', 'a', 'b', 'c', 'C']);
});

it('should mergeMap many outer to inner arrays, using resultSelector', async () => {
  expect.assertions(1);

  const source = Observable.from([1, 2, 3]);
  const project = (num: number, str: string) => `${num}/${str}`;

  const observable = k$(source)(mergeMap(() => $of('a', 'b', 'c'), project));
  const res = collect(observable);

  expect(await res).toEqual([
    '1/a',
    '1/b',
    '1/c',
    '2/a',
    '2/b',
    '2/c',
    '3/a',
    '3/b',
    '3/c',
    'C'
  ]);
});
