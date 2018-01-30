import sinon from 'sinon';

import { PluginPack } from '../plugin_pack';
import { PluginSpec } from '../../plugin_spec';

describe('plugin discovery/plugin pack', () => {
  describe('constructor', () => {
    it('requires an object', () => {
      expect(() => {
        new PluginPack();
      }).toThrow();
    });
  });
  describe('#getPkg()', () => {
    it('returns the `pkg` constructor argument', () => {
      const pkg = {};
      const pack = new PluginPack({ pkg });
      expect(pack.getPkg()).toBe(pkg);
    });
  });
  describe('#getPath()', () => {
    it('returns the `path` constructor argument', () => {
      const path = {};
      const pack = new PluginPack({ path });
      expect(pack.getPath()).toBe(path);
    });
  });
  describe('#getPluginSpecs()', () => {
    it('calls the `provider` constructor argument with an api including a single sub class of PluginSpec', () => {
      const provider = sinon.stub();
      const pack = new PluginPack({ provider });
      sinon.assert.notCalled(provider);
      pack.getPluginSpecs();
      sinon.assert.calledOnce(provider);
      sinon.assert.calledWithExactly(provider, {
        Plugin: sinon.match(Class => {
          return Class.prototype instanceof PluginSpec;
        }, 'Subclass of PluginSpec')
      });
    });

    it('casts undefined return value to array', () => {
      const pack = new PluginPack({ provider: () => undefined });
      expect(pack.getPluginSpecs()).toEqual([]);
    });

    it('casts single PluginSpec to an array', () => {
      const pack = new PluginPack({
        path: '/dev/null',
        pkg: { name: 'foo', version: 'kibana' },
        provider: ({ Plugin }) => new Plugin({})
      });

      const specs = pack.getPluginSpecs();
      expect(specs).toBeInstanceOf(Array);
      expect(specs).toHaveLength(1);
      expect(specs[0]).toBeInstanceOf(PluginSpec);
    });

    it('returns an array of PluginSpec', () => {
      const pack = new PluginPack({
        path: '/dev/null',
        pkg: { name: 'foo', version: 'kibana' },
        provider: ({ Plugin }) => [
          new Plugin({}),
          new Plugin({}),
        ]
      });

      const specs = pack.getPluginSpecs();
      expect(specs).toBeInstanceOf(Array);
      expect(specs).toHaveLength(2);
      expect(specs[0]).toBeInstanceOf(PluginSpec);
      expect(specs[1]).toBeInstanceOf(PluginSpec);
    });

    it('throws if non-undefined return value is not an instance of api.Plugin', () => {
      let OtherPluginSpecClass;
      const otherPack = new PluginPack({
        path: '/dev/null',
        pkg: { name: 'foo', version: 'kibana' },
        provider: (api) => {
          OtherPluginSpecClass = api.Plugin;
        }
      });

      // call getPluginSpecs() on other pack to get it's api.Plugin class
      otherPack.getPluginSpecs();

      const badPacks = [
        new PluginPack({ provider: () => false }),
        new PluginPack({ provider: () => null }),
        new PluginPack({ provider: () => 1 }),
        new PluginPack({ provider: () => 'true' }),
        new PluginPack({ provider: () => true }),
        new PluginPack({ provider: () => new Date() }),
        new PluginPack({ provider: () => /foo.*bar/ }),
        new PluginPack({ provider: () => function () {} }),
        new PluginPack({ provider: () => new OtherPluginSpecClass({}) }),
      ];

      for (const pack of badPacks) {
        expect(() => pack.getPluginSpecs()).toThrowError('unexpected plugin export');
      }
    });
  });
});
