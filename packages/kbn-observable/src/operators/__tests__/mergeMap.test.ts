import { Observable } from '../../Observable';
import { k$ } from '../../k$';
import { BehaviorSubject } from '../../BehaviorSubject';
import { mergeMap, delay } from '../';
import { $of, $concat, $from } from '../../factories';

it('should map values to constant resolved promises and merge', done => {
  expect.assertions(1);

  const source = Observable.from([4, 3, 2, 1]);
  const results: any[] = [];

  k$(source, mergeMap(() => Promise.resolve(42))).subscribe({
    next(x) {
      results.push(x);
    },
    error(err) {
      done(err);
    },
    complete() {
      expect(results).toEqual([42, 42, 42, 42]);
      done();
    }
  });
});

it('should map values to constant rejected promises and merge', done => {
  expect.assertions(1);

  const source = Observable.from([4, 3, 2, 1]);

  k$(source, mergeMap(() => Promise.reject(42))).subscribe({
    next(val) {
      done(new Error(`next handled unexpectedly called with value: ${val}`));
    },
    error(err) {
      expect(err).toBe(42);
      done();
    },
    complete() {
      done(new Error(`complete handled unexpectedly called`));
    }
  });
});

it('should map values to resolved promises and merge', done => {
  expect.assertions(1);

  const source = Observable.from([4, 3, 2, 1]);
  const project = (value: number, index: number) =>
    Promise.resolve(value + index);

  const results: number[] = [];
  k$(source, mergeMap(project)).subscribe({
    next(x) {
      results.push(x);
    },
    error(err) {
      done(err);
    },
    complete() {
      expect(results).toEqual([4, 4, 4, 4]);
      done();
    }
  });
});

it('should map values to rejected promises and merge', done => {
  expect.assertions(1);

  const source = Observable.from([4, 3, 2, 1]);
  const project = (value: number, index: number) =>
    Promise.reject(`${value} / ${index}`);

  k$(source, mergeMap(project)).subscribe({
    next(val) {
      done(new Error(`next handled unexpectedly called with value: ${val}`));
    },
    error(err) {
      expect(err).toBe('4 / 0');
      done();
    },
    complete() {
      done(new Error(`complete handled unexpectedly called`));
    }
  });
});

it('should mergeMap values to resolved promises with resultSelector', done => {
  expect.assertions(2);

  const source = Observable.from([4, 3, 2, 1]);
  const resultSelector = jest.fn(() => 8);
  const project = (value: number, index: number) =>
    Promise.resolve([value, index]);

  const results: any = [];

  k$(source, mergeMap(project, resultSelector)).subscribe({
    next(x) {
      results.push(x);
    },
    error(err) {
      done(err);
    },
    complete() {
      expect(results).toEqual([8, 8, 8, 8]);
      expect(resultSelector.mock.calls).toMatchSnapshot();
      done();
    }
  });
});

it('should mergeMap values to rejected promises with resultSelector', done => {
  expect.assertions(1);

  const source = Observable.from([4, 3, 2, 1]);
  const project = (value: number, index: number) =>
    Promise.reject(`${value} / ${index}`);
  const resultSelector = () => {
    throw 'this should not be called';
  };

  k$(source, mergeMap(project, resultSelector)).subscribe({
    next(val) {
      done(new Error(`next handled unexpectedly called with value: ${val}`));
    },
    error(err) {
      expect(err).toBe('4 / 0');
      done();
    },
    complete() {
      done(new Error(`complete handled unexpectedly called`));
    }
  });
});

it('should mergeMap many outer values to many inner values', done => {
  expect.assertions(1);

  const source = Observable.from([1, 2, 3, 4]);
  const project = (value: number, index: number) =>
    $concat(
      k$($of(`${value}-a`), delay(5)),
      k$($of(`${value}-b`), delay(10)),
      k$($of(`${value}-c`), delay(15))
    );

  const results: any[] = [];
  k$(source, mergeMap(project)).subscribe({
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
      k$($of(`${value}-a`), delay(5)),
      k$($of(`${value}-b`), delay(10)),
      k$($of(`${value}-c`), delay(15))
    );

  const results: any[] = [];
  k$(source, mergeMap(project)).subscribe({
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
  k$(source, mergeMap(project)).subscribe({
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
      k$($of(`${value}-a`), delay(5)),
      k$($of(`${value}-b`), delay(10)),
      k$($of(`${value}-c`), delay(15))
    );

  const results: any[] = [];
  k$(source, mergeMap(project)).subscribe({
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
  }, 20);
});

it('should mergeMap many outer to an array for each value', done => {
  expect.assertions(1);

  const source = Observable.from([1, 2, 3]);
  const results: any[] = [];

  k$(source, mergeMap(() => $of('a', 'b', 'c'))).subscribe({
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

  k$(source, mergeMap(() => $of('a', 'b', 'c'), project)).subscribe({
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
