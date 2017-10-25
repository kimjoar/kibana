import { Observable } from '../../Observable';
import { k$ } from '../../k$';
import { BehaviorSubject } from '../../BehaviorSubject';
import { mergeMap, delay } from '../';
import { $of, $concat } from '../../factories';

it('should mergeMap many outer values to many inner values', done => {
  expect.assertions(1);

  const source = Observable.from([1, 2, 3, 4]);
  const project = (value: number, index: number) =>
    $concat(
      k$($of(`${value}-a`))(delay(20)),
      k$($of(`${value}-b`))(delay(40)),
      k$($of(`${value}-c`))(delay(60))
    );

  const results: any[] = [];
  k$(source)(mergeMap(project)).subscribe({
    next(x) {
      results.push(x);
    },
    error(err) {
      done(err);
    },
    complete() {
      const expected = [
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
        '4-c'
      ];
      expect(results).toEqual(expected);
      done();
    }
  });
});

it('should mergeMap many outer values to many inner values, early complete', done => {
  expect.assertions(1);

  const source = new BehaviorSubject(1);
  const project = (value: number, index: number) =>
    $concat(
      k$($of(`${value}-a`))(delay(20)),
      k$($of(`${value}-b`))(delay(40)),
      k$($of(`${value}-c`))(delay(60))
    );

  const results: any[] = [];
  k$(source)(mergeMap(project)).subscribe({
    next(x) {
      results.push(x);
    },
    error(err) {
      done(err);
    },
    complete() {
      const expected = [
        '1-a',
        '2-a',
        '3-a',
        '1-b',
        '2-b',
        '3-b',
        '1-c',
        '2-c',
        '3-c'
      ];
      expect(results).toEqual(expected);
      done();
    }
  });

  source.next(2);
  source.next(3);
  source.complete();

  // This shouldn't end up in the results
  source.next(4);
});

it('should mergeMap many outer to many inner, and inner throws', done => {
  expect.assertions(1);

  const source = Observable.from([1, 2, 3, 4]);
  const project = (value: number, index: number) => {
    if (index > 1) {
      return new Observable(observer => {
        observer.error(new Error('fail'));
      });
    }
    return Observable.of(value);
  };

  const results: any[] = [];
  k$(source)(mergeMap(project)).subscribe({
    next(x) {
      results.push(x);
    },
    error(err) {
      expect(results).toEqual([1, 2]);
      done();
    },
    complete() {
      done(new Error(`complete handled unexpectedly called`));
    }
  });
});

it('should mergeMap many outer to many inner, and outer throws', done => {
  expect.assertions(1);

  const source = new BehaviorSubject(1);
  const project = (value: number, index: number) =>
    $concat(
      k$($of(`${value}-a`))(delay(20)),
      k$($of(`${value}-b`))(delay(40)),
      k$($of(`${value}-c`))(delay(60))
    );

  const results: any[] = [];
  k$(source)(mergeMap(project)).subscribe({
    next(x) {
      results.push(x);
    },
    error(err) {
      expect(results).toEqual(['1-a', '2-a', '3-a', '1-b', '2-b', '3-b']);
      done();
    },
    complete() {
      done(new Error('complete handled unexpectedly called'));
    }
  });

  source.next(2);
  source.next(3);

  setTimeout(() => {
    source.error(new Error('outer fails'));
    // This shouldn't end up in the results
    source.next(4);
  }, 70);
});

it('should mergeMap many outer to an array for each value', done => {
  expect.assertions(1);

  const source = Observable.from([1, 2, 3]);
  const results: any[] = [];

  k$(source)(mergeMap(() => $of('a', 'b', 'c'))).subscribe({
    next(x) {
      results.push(x);
    },
    error(err) {
      done(err);
    },
    complete() {
      expect(results).toEqual(['a', 'b', 'c', 'a', 'b', 'c', 'a', 'b', 'c']);
      done();
    }
  });
});

it('should mergeMap many outer to inner arrays, using resultSelector', done => {
  expect.assertions(1);

  const source = Observable.from([1, 2, 3]);
  const results: any[] = [];

  const project = (num: number, str: string) => `${num}/${str}`;

  k$(source)(mergeMap(() => $of('a', 'b', 'c'), project)).subscribe({
    next(x) {
      results.push(x);
    },
    error(err) {
      done(err);
    },
    complete() {
      expect(results).toEqual([
        '1/a',
        '1/b',
        '1/c',
        '2/a',
        '2/b',
        '2/c',
        '3/a',
        '3/b',
        '3/c'
      ]);
      done();
    }
  });
});
