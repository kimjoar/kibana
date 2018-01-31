import {
  createPromiseFromStreams,
  createListStream,
  createConcatStream,
  createJsonStringifyStream
} from '../';

function createCircularStructure() {
  const obj = {};
  obj.obj = obj; // create circular reference
  return obj;
}

describe('jsonStringifyStream', () => {
  describe('standard usage', () => {
    it('stringifys js values', async () => {
      const str = createJsonStringifyStream();
      const dataPromise = new Promise((resolve, reject) => {
        str.on('data', resolve);
        str.on('error', reject);
      });
      str.write({ foo: 'bar' });

      expect(await dataPromise).toBe('{"foo":"bar"}');
    });

    it('stringifys js values passed from a list stream', async () => {
      const all = await createPromiseFromStreams([
        createListStream([
          'foo',
          1
        ]),
        createJsonStringifyStream(),
        createConcatStream([])
      ]);

      expect(all).toEqual(['"foo"', '1']);
    });
  });

  describe('error handling', () => {
    it('emits an error when there is a parse failure', async () => {
      const str = createJsonStringifyStream();
      const errorPromise = new Promise(resolve => str.once('error', resolve));
      str.write(createCircularStructure());
      const err = await errorPromise;
      expect(err).toBeInstanceOf(Error);
      expect(err.name).toBe('TypeError');
      expect(err.message).toContain('circular');
    });

    it('continues parsing after an error', async () => {
      const str = createJsonStringifyStream();

      const firstEmitPromise = new Promise(resolve => {
        str.once('error', v => resolve({ name: 'error', value: v }));
        str.once('data', v => resolve({ name: 'data', value: v }));
      });

      str.write(createCircularStructure());

      const firstEmit = await firstEmitPromise;
      expect(firstEmit).toHaveProperty('name', 'error');
      expect(firstEmit.value).toBeInstanceOf(Error);

      const secondEmitPromise = new Promise(resolve => {
        str.once('error', v => resolve({ name: 'error', value: v }));
        str.once('data', v => resolve({ name: 'data', value: v }));
      });

      str.write('foo');
      const secondEmit = await secondEmitPromise;
      expect(secondEmit).toHaveProperty('name', 'data');
      expect(secondEmit).toHaveProperty('value', '"foo"');
    });
  });
});
