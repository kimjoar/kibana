import { $from } from '../';
import { $fromCallback } from '../$fromCallback';
import { Subject } from '../../Subject';

test('returns raw value', () => {
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();

  $fromCallback(() => 'foo').subscribe(next, error, complete);

  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith('foo');
  expect(error).not.toHaveBeenCalled();
  expect(complete).toHaveBeenCalledTimes(1);
});

test('returns observable that completes immediately', () => {
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();

  $fromCallback(() => $from([1, 2, 3])).subscribe(next, error, complete);

  expect(next).toHaveBeenCalledTimes(3);
  expect(next.mock.calls).toEqual([[1], [2], [3]]);
  expect(error).not.toHaveBeenCalled();
  expect(complete).toHaveBeenCalledTimes(1);
});

test('returns observable that completes later', () => {
  const subject = new Subject();

  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();

  $fromCallback(() => subject).subscribe(next, error, complete);

  expect(next).not.toHaveBeenCalled();
  expect(error).not.toHaveBeenCalled();
  expect(complete).not.toHaveBeenCalled();

  subject.next('foo');
  expect(next).toHaveBeenCalledTimes(1);
  expect(error).not.toHaveBeenCalled();
  expect(complete).not.toHaveBeenCalled();

  subject.complete();
  expect(error).not.toHaveBeenCalled();
  expect(complete).toHaveBeenCalledTimes(1);
});
