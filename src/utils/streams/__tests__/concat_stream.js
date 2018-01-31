import {
  createListStream,
  createPromiseFromStreams,
  createConcatStream
} from '../';

describe('concatStream', () => {
  it('accepts an initial value', async () => {
    const output = await createPromiseFromStreams([
      createListStream([1, 2, 3]),
      createConcatStream([0])
    ]);

    expect(output).toEqual([0, 1, 2, 3]);
  });

  describe(`combines using the previous value's concat method`, () => {
    it('works with strings', async () => {
      const output = await createPromiseFromStreams([
        createListStream([
          'a',
          'b',
          'c'
        ]),
        createConcatStream()
      ]);
      expect(output).toEqual('abc');
    });

    it('works with arrays', async () => {
      const output = await createPromiseFromStreams([
        createListStream([
          [1],
          [2, 3, 4],
          [10]
        ]),
        createConcatStream()
      ]);
      expect(output).toEqual([1, 2, 3, 4, 10]);
    });

    it('works with a mixture, starting with array', async () => {
      const output = await createPromiseFromStreams([
        createListStream([
          [],
          1,
          2,
          3,
          4,
          [5, 6, 7]
        ]),
        createConcatStream()
      ]);
      expect(output).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('fails when the value does not have a concat method', async () => {
      let promise;
      try {
        promise = createPromiseFromStreams([
          createListStream([1, '1']),
          createConcatStream()
        ]);
      } catch (err) {
        expect.fail('createPromiseFromStreams() should not fail synchronously');
      }

      try {
        await promise;
        expect.fail('Promise should have rejected');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toContain('concat');
      }
    });
  });
});
