import { Observable } from '../../Observable';
import { Subject } from '../../Subject';
import { k$ } from '../../k$';
import { $of } from '../../factories';
import { distinctUntilChanged } from '../../operators';

test('should distinguish between values', async () => {
  const values$ = new Subject<string>();

  const actual: any[] = [];
  k$(values$)(distinctUntilChanged()).subscribe({
    next(v) {
      actual.push(v);
    }
  });

  values$.next('a');
  values$.next('a');
  values$.next('a');
  values$.next('b');
  values$.next('b');
  values$.next('a');
  values$.next('a');
  values$.complete();

  expect(actual).toEqual(['a', 'b', 'a']);
});

test('should distinguish between values and does not complete', () => {
  const values$ = new Subject<string>();

  const actual: any[] = [];
  k$(values$)(distinctUntilChanged()).subscribe({
    next(v) {
      actual.push(v);
    }
  });

  values$.next('a');
  values$.next('a');
  values$.next('a');
  values$.next('b');
  values$.next('b');
  values$.next('a');
  values$.next('a');

  expect(actual).toEqual(['a', 'b', 'a']);
});

test('should complete if source is empty', done => {
  const values$ = $of();

  k$(values$)(distinctUntilChanged()).subscribe({
    complete: done
  });
});

test('should emit if source emits single element only', () => {
  const values$ = new Subject<string>();

  const actual: any[] = [];
  k$(values$)(distinctUntilChanged()).subscribe({
    next(x) {
      actual.push(x);
    }
  });

  values$.next('a');

  expect(actual).toEqual(['a']);
});

test('should emit if source is scalar', () => {
  const values$ = $of('a');

  const actual: any[] = [];
  k$(values$)(distinctUntilChanged()).subscribe({
    next(v) {
      actual.push(v);
    }
  });

  expect(actual).toEqual(['a']);
});

test('should raises error if source raises error', () => {
  const values$ = new Subject<string>();

  const actual: any[] = [];
  const error = jest.fn();

  k$(values$)(distinctUntilChanged()).subscribe({
    next(v) {
      actual.push(v);
    },
    error
  });

  const thrownError = new Error('nope');
  values$.next('a');
  values$.next('a');
  values$.error(thrownError);

  expect(actual).toEqual(['a']);
  expect(error).toHaveBeenCalledWith(thrownError);
});

test('should raises error if source throws', () => {
  const thrownError = new Error('fail');

  const obs = new Observable(observer => {
    observer.error(thrownError);
  });

  const error = jest.fn();
  k$(obs)(distinctUntilChanged()).subscribe({
    error
  });

  expect(error).toHaveBeenCalledWith(thrownError);
});

test('should allow unsubscribing early and explicitly', () => {
  const values$ = new Subject<string>();

  const actual: any[] = [];
  const sub = k$(values$)(distinctUntilChanged()).subscribe({
    next(v) {
      actual.push(v);
    }
  });

  values$.next('a');
  values$.next('a');
  values$.next('b');

  sub.unsubscribe();

  values$.next('c');
  values$.next('d');

  expect(actual).toEqual(['a', 'b']);
});

test('should emit once if comparator returns true always regardless of source emits', () => {
  const values$ = new Subject<string>();

  const actual: any[] = [];
  k$(values$)(distinctUntilChanged(() => true)).subscribe({
    next(v) {
      actual.push(v);
    }
  });

  values$.next('a');
  values$.next('a');
  values$.next('b');
  values$.next('c');

  expect(actual).toEqual(['a']);
});

test('should emit all if comparator returns false always regardless of source emits', () => {
  const values$ = new Subject<string>();

  const actual: any[] = [];
  k$(values$)(distinctUntilChanged(() => false)).subscribe({
    next(v) {
      actual.push(v);
    }
  });

  values$.next('a');
  values$.next('a');
  values$.next('a');
  values$.next('a');

  expect(actual).toEqual(['a', 'a', 'a', 'a']);
});

test('should distinguish values by comparator', () => {
  const values$ = new Subject<number>();

  const comparator = (x: number, y: number) => y % 2 === 0;

  const actual: any[] = [];
  k$(values$)(distinctUntilChanged(comparator)).subscribe({
    next(v) {
      actual.push(v);
    }
  });

  values$.next(1);
  values$.next(2);
  values$.next(3);
  values$.next(4);

  expect(actual).toEqual([1, 3]);
});
