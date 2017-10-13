import { Observable, SubscriptionObserver } from '../../Observable';
import { k$ } from '../../k$';
import { switchMap, toArray, toPromise } from '../';

const collect = <T>(source: Observable<T>) =>
  k$(source, toArray(), toPromise());
const number$ = Observable.of(1, 2, 3);

test('returns the modified value', async () => {
  const expected = ['a1', 'b1', 'c1', 'a2', 'b2', 'c2', 'a3', 'b3', 'c3'];

  const values = await collect(
    k$(number$, switchMap(x => Observable.of('a' + x, 'b' + x, 'c' + x)))
  );

  expect(values).toEqual(expected);
});

test('injects index to map', async () => {
  const expected = [0, 1, 2];

  const values = await collect(
    k$(number$, switchMap((x, i) => Observable.of(i)))
  );

  expect(values).toEqual(expected);
});

test('should unsub inner observables', () => {
  expect.assertions(1);

  const unsubbed: string[] = [];
  const obs$ = Observable.of('a', 'b');

  k$(
    obs$,
    switchMap(
      x =>
        new Observable(observer => {
          observer.complete();
          return () => {
            unsubbed.push(x);
          };
        })
    )
  ).subscribe({
    complete() {
      expect(unsubbed).toEqual(['a', 'b']);
    }
  });
});

test('should switch inner observables', () => {
  expect.assertions(1);

  let xObserver: SubscriptionObserver<string>;
  let yObserver: SubscriptionObserver<string>;

  const choose = {
    x: new Observable(observer => {
      xObserver = observer;
    }),
    y: new Observable(observer => {
      yObserver = observer;
    })
  };

  let outerObserver: SubscriptionObserver<'x' | 'y'>;
  const obs$ = new Observable<'x' | 'y'>(observer => {
    outerObserver = observer;
  });

  const actual: any[] = [];

  k$(obs$, switchMap(x => choose[x])).subscribe({
    next(val) {
      actual.push(val);
    }
  });

  outerObserver!.next('x');
  xObserver!.next('foo');
  xObserver!.next('bar');

  outerObserver!.next('y');
  xObserver!.next('baz');
  yObserver!.next('quux');

  outerObserver!.complete();

  expect(actual).toEqual(['foo', 'bar', 'quux']);
});

test('should switch inner empty and empty', () => {
  expect.assertions(1);

  let xObserver: SubscriptionObserver<string>;
  let yObserver: SubscriptionObserver<string>;

  const choose = {
    x: new Observable(observer => {
      xObserver = observer;
    }),
    y: new Observable(observer => {
      yObserver = observer;
    })
  };

  let outerObserver: SubscriptionObserver<'x' | 'y'>;
  const obs$ = new Observable<'x' | 'y'>(observer => {
    outerObserver = observer;
  });

  const next = jest.fn();

  k$(obs$, switchMap(x => choose[x])).subscribe({
    next
  });

  outerObserver!.next('x');
  xObserver!.complete();

  outerObserver!.next('y');
  yObserver!.complete();

  outerObserver!.complete();

  expect(next).not.toHaveBeenCalled();
});

test('should switch inner never and throw', () => {
  let xObserver: SubscriptionObserver<string>;

  const e = new Error('sad');

  const choose = {
    x: new Observable(observer => {
      xObserver = observer;
    }),
    y: new Observable(observer => {
      throw e;
    })
  };

  let outerObserver: SubscriptionObserver<'x' | 'y'>;
  const obs$ = new Observable<'x' | 'y'>(observer => {
    outerObserver = observer;
  });

  const error = jest.fn();
  const complete = jest.fn();
  k$(obs$, switchMap(x => choose[x])).subscribe({
    error,
    complete
  });

  outerObserver!.next('x');
  outerObserver!.next('y');
  outerObserver!.complete();

  expect(error).toHaveBeenCalledTimes(1);
  expect(error).toHaveBeenCalledWith(e);
  expect(complete).not.toHaveBeenCalled();
});

test('should handle outer throw', () => {
  const e = new Error('foo');
  const obs$ = new Observable<string>(observer => {
    throw e;
  });

  const error = jest.fn();
  const complete = jest.fn();
  k$(obs$, switchMap(x => Observable.of(x))).subscribe({
    error,
    complete
  });

  expect(error).toHaveBeenCalledTimes(1);
  expect(error).toHaveBeenCalledWith(e);
  expect(complete).not.toHaveBeenCalled();
});

test('should handle outer error', () => {
  let xObserver: SubscriptionObserver<string>;

  const choose = {
    x: new Observable(observer => {
      xObserver = observer;
    })
  };

  let outerObserver: SubscriptionObserver<'x'>;
  const obs$ = new Observable<'x'>(observer => {
    outerObserver = observer;
  });

  const actual: any[] = [];
  const error = jest.fn();

  k$(obs$, switchMap(x => choose[x])).subscribe({
    next(val) {
      actual.push(val);
    },
    error
  });

  outerObserver!.next('x');

  xObserver!.next('a');
  xObserver!.next('b');
  xObserver!.next('c');

  const e = new Error('foo');
  outerObserver!.error(e);

  xObserver!.next('d');
  xObserver!.next('e');

  expect(actual).toEqual(['a', 'b', 'c']);
  expect(error).toHaveBeenCalledTimes(1);
  expect(error).toHaveBeenCalledWith(e);
});

it('should raise error when projection throws', () => {
  let outerObserver: SubscriptionObserver<any>;
  const obs$ = new Observable<any>(observer => {
    outerObserver = observer;
  });

  const error = jest.fn();
  const complete = jest.fn();

  const e = new Error('foo');

  k$(
    obs$,
    switchMap(x => {
      throw e;
    })
  ).subscribe({
    error,
    complete
  });

  outerObserver!.next('x');

  expect(error).toHaveBeenCalledTimes(1);
  expect(error).toHaveBeenCalledWith(e);
  expect(complete).not.toHaveBeenCalled();
});

test('should switch inner cold observables, outer is unsubscribed early', () => {
  let xObserver: SubscriptionObserver<string>;
  let yObserver: SubscriptionObserver<string>;

  const choose = {
    x: new Observable(observer => {
      xObserver = observer;
    }),
    y: new Observable(observer => {
      yObserver = observer;
    })
  };

  let outerObserver: SubscriptionObserver<'x' | 'y'>;
  const obs$ = new Observable<'x' | 'y'>(observer => {
    outerObserver = observer;
  });

  const actual: any[] = [];

  const sub = k$(obs$, switchMap(x => choose[x])).subscribe({
    next(val) {
      actual.push(val);
    }
  });

  outerObserver!.next('x');
  xObserver!.next('foo');
  xObserver!.next('bar');

  outerObserver!.next('y');
  yObserver!.next('baz');
  yObserver!.next('quux');

  sub.unsubscribe();

  xObserver!.next('post x');
  xObserver!.complete();

  yObserver!.next('post y');
  yObserver!.complete();

  expect(actual).toEqual(['foo', 'bar', 'baz', 'quux']);
});
