import { resolve } from 'path';

import { createPacksInDirectory$ } from '../packs_in_directory';
import { PluginPack } from '../plugin_pack';

import {
  PLUGINS_DIR,
  assertInvalidDirectoryError,
  assertInvalidPackError,
} from './utils';

describe('plugin discovery/packs in directory', () => {
  describe('createPacksInDirectory$()', () => {
    describe('errors emitted as { error } results', () => {
      async function checkError(path, check) {
        const results = await createPacksInDirectory$(path).toArray().toPromise();
        expect(results).toHaveLength(1);
        expect(Object.keys(results[0])).toEqual(['error']);
        const { error } = results[0];
        await check(error);
      }

      it('undefined path', () => checkError(undefined, error => {
        assertInvalidDirectoryError(error);
        expect(error.message).toContain('path must be a string');
      }));
      it('relative path', () => checkError('my/plugins', error => {
        assertInvalidDirectoryError(error);
        expect(error.message).toContain('path must be absolute');
      }));
      it('./relative path', () => checkError('./my/pluginsd', error => {
        assertInvalidDirectoryError(error);
        expect(error.message).toContain('path must be absolute');
      }));
      it('non-existent path', () => checkError(resolve(PLUGINS_DIR, 'notreal'), error => {
        assertInvalidDirectoryError(error);
        expect(error.message).toContain('no such file or directory');
      }));
      it('path to a file', () => checkError(resolve(PLUGINS_DIR, 'index.js'), error => {
        assertInvalidDirectoryError(error);
        expect(error.message).toContain('not a directory');
      }));
    });

    it('includes child errors for invalid packs within a valid directory', async () => {
      const results = await createPacksInDirectory$(PLUGINS_DIR).toArray().toPromise();

      const errors = results
        .map(result => result.error)
        .filter(Boolean);

      const packs = results
        .map(result => result.pack)
        .filter(Boolean);

      errors.forEach(assertInvalidPackError);
      packs.forEach(pack => expect(pack).toBeInstanceOf(PluginPack));
      // there should be one result for each item in PLUGINS_DIR
      expect(results).toHaveLength(8);
      // six of the fixtures are errors of some sorta
      expect(errors).toHaveLength(6);
      // two of them are valid
      expect(packs).toHaveLength(2);

    });
  });
});
