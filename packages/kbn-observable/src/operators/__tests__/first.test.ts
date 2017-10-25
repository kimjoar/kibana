import { k$ } from '../../k$';
import { first } from '../';
import { Subject } from '../../Subject';

test('returns the first value, then completes', async () => {
  const values$ = new Subject();

  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();

  k$(values$)(first()).subscribe({
    next,
    complete
  });

  values$.next('foo');
  values$.next('bar');

  expect(error).not.toHaveBeenCalled();
  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith('foo');
  expect(complete).toHaveBeenCalledTimes(1);
});

test('handles source completing after receiving value', async () => {
  const values$ = new Subject();

  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();

  k$(values$)(first()).subscribe({
    next,
    error,
    complete
  });

  values$.next('foo');
  values$.next('bar');
  values$.complete();

  expect(error).not.toHaveBeenCalled();
  expect(complete).toHaveBeenCalledTimes(1);
});

test('returns error if completing without receiving any value', async () => {
  const values$ = new Subject();

  const error = jest.fn();

  k$(values$)(first()).subscribe({
    error
  });

  values$.complete();

  expect(error).toHaveBeenCalledTimes(1);
  expect(error.mock.calls).toMatchSnapshot();
});
