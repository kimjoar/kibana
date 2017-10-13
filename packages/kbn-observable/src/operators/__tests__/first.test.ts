import { k$ } from '../../k$';
import { first } from '../../operators';
import { Subject } from '../../Subject';

test('returns the first value, then completes', async () => {
  const values$ = new Subject();

  const next = jest.fn();
  const complete = jest.fn();

  k$(values$)(first()).subscribe({
    next,
    complete
  });

  values$.next('test');

  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith('test');
  expect(complete).toHaveBeenCalled();
});

test('returns error if completing without receiving any value', async () => {
  const values$ = new Subject();

  const error = jest.fn();

  k$(values$)(first()).subscribe({
    error
  });

  values$.complete();

  expect(error).toHaveBeenCalledTimes(1);
  expect(error.mock.calls[0][0].message).toMatchSnapshot();
});
