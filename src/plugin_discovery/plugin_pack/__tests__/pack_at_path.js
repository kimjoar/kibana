import { resolve } from 'path';

import { createPackAtPath$ } from '../pack_at_path';
import { PluginPack } from '../plugin_pack';
import {
  PLUGINS_DIR,
  assertInvalidPackError,
  assertInvalidDirectoryError
} from './utils';


describe('plugin discovery/plugin_pack', () => {
  describe('createPackAtPath$()', () => {
    it('returns an observable', () => {
      expect(typeof createPackAtPath$().subscribe).toBe('function');
    });
    it('gets the default provider from prebuilt babel modules', async () => {
      const results = await createPackAtPath$(resolve(PLUGINS_DIR, 'prebuilt')).toArray().toPromise();
      expect(results).toHaveLength(1);
      expect(Object.keys(results[0])).toEqual(['pack']);
      expect(results[0].pack).toBeInstanceOf(PluginPack);
    });
    describe('errors emitted as { error } results', () => {
      async function checkError(path, check) {
        const results = await createPackAtPath$(path).toArray().toPromise();
        expect(results).toHaveLength(1);
        expect(Object.keys(results[0])).toEqual(['error']);
        const { error } = results[0];
        await check(error);
      }
      it('undefined path', () => checkError(undefined, error => {
        assertInvalidDirectoryError(error);
        expect(error.message).toContain('path must be a string');
      }));
      it('relative path', () => checkError('plugins/foo', error => {
        assertInvalidDirectoryError(error);
        expect(error.message).toContain('path must be absolute');
      }));
      it('./relative path', () => checkError('./plugins/foo', error => {
        assertInvalidDirectoryError(error);
        expect(error.message).toContain('path must be absolute');
      }));
      it('non-existent path', () => checkError(resolve(PLUGINS_DIR, 'baz'), error => {
        assertInvalidPackError(error);
        expect(error.message).toContain('must be a directory');
      }));
      it('path to a file', () => checkError(resolve(PLUGINS_DIR, 'index.js'), error => {
        assertInvalidPackError(error);
        expect(error.message).toContain('must be a directory');
      }));
      it('directory without a package.json', () => checkError(resolve(PLUGINS_DIR, 'lib'), error => {
        assertInvalidPackError(error);
        expect(error.message).toContain('must have a package.json file');
      }));
      it('directory with an invalid package.json', () => checkError(resolve(PLUGINS_DIR, 'broken'), error => {
        assertInvalidPackError(error);
        expect(error.message).toContain('must have a valid package.json file');
      }));
      it('default export is an object', () => checkError(resolve(PLUGINS_DIR, 'exports_object'), error => {
        assertInvalidPackError(error);
        expect(error.message).toContain('must export a function');
      }));
      it('default export is an number', () => checkError(resolve(PLUGINS_DIR, 'exports_number'), error => {
        assertInvalidPackError(error);
        expect(error.message).toContain('must export a function');
      }));
      it('default export is an string', () => checkError(resolve(PLUGINS_DIR, 'exports_string'), error => {
        assertInvalidPackError(error);
        expect(error.message).toContain('must export a function');
      }));
    });
  });
});
