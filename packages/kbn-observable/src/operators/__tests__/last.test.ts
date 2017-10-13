import { k$ } from '../../k$';
import { $from } from '../../factories';
import { last } from '../../operators';

const number$ = $from([1, 2, 3]);

test('returns the last value', async () => {
  const next = jest.fn();
  k$(number$)(last()).subscribe({
    next
  });

  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(3);
});
