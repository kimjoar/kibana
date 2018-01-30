import { resolve } from 'path';

import sinon from 'sinon';

import { PluginPack } from '../../plugin_pack';
import { PluginSpec } from '../plugin_spec';
import * as IsVersionCompatibleNS from '../is_version_compatible';

const fooPack = new PluginPack({
  path: '/dev/null',
  pkg: { name: 'foo', version: 'kibana' },
});

describe('plugin discovery/plugin spec', () => {
  describe('PluginSpec', () => {
    describe('validation', () => {
      it('throws if missing spec.id AND Pack has no name', () => {
        const pack = new PluginPack({ pkg: {} });
        expect(() => new PluginSpec(pack, {}))
          .toThrowError('Unable to determine plugin id');
      });

      it('throws if missing spec.kibanaVersion AND Pack has no version', () => {
        const pack = new PluginPack({ pkg: { name: 'foo' } });
        expect(() => new PluginSpec(pack, {}))
          .toThrowError('Unable to determine plugin version');
      });

      it('throws if spec.require is defined, but not an array', () => {
        function assert(require) {
          expect(() => new PluginSpec(fooPack, { require }))
            .toThrowError('"plugin.require" must be an array of plugin ids');
        }

        assert(null);
        assert('');
        assert('kibana');
        assert(1);
        assert(0);
        assert(/a.*b/);
      });

      it('throws if spec.publicDir is truthy and not a string', () => {
        function assert(publicDir) {
          expect(() => new PluginSpec(fooPack, { publicDir }))
            .toThrowError('Path must be a string');
        }

        assert(1);
        assert(function () {});
        assert([]);
        assert(/a.*b/);
      });

      it('throws if spec.publicDir is not an absolute path', () => {
        function assert(publicDir) {
          expect(() => new PluginSpec(fooPack, { publicDir }))
            .toThrowError('plugin.publicDir must be an absolute path');
        }

        assert('relative/path');
        assert('./relative/path');
      });

      it('throws if spec.publicDir basename is not `public`', () => {
        function assert(publicDir) {
          expect(() => new PluginSpec(fooPack, { publicDir }))
            .toThrowError('must end with a "public" directory');
        }

        assert('/www');
        assert('/www/');
        assert('/www/public/my_plugin');
        assert('/www/public/my_plugin/');
      });
    });

    describe('#getPack()', () => {
      it('returns the pack', () => {
        const spec = new PluginSpec(fooPack, {});
        expect(spec.getPack()).toBe(fooPack);
      });
    });

    describe('#getPkg()', () => {
      it('returns the pkg from the pack', () => {
        const spec = new PluginSpec(fooPack, {});
        expect(spec.getPkg()).toBe(fooPack.getPkg());
      });
    });

    describe('#getPath()', () => {
      it('returns the path from the pack', () => {
        const spec = new PluginSpec(fooPack, {});
        expect(spec.getPath()).toBe(fooPack.getPath());
      });
    });

    describe('#getId()', () => {
      it('uses spec.id', () => {
        const spec = new PluginSpec(fooPack, {
          id: 'bar'
        });

        expect(spec.getId()).toBe('bar');
      });

      it('defaults to pack.pkg.name', () => {
        const spec = new PluginSpec(fooPack, {});

        expect(spec.getId()).toBe('foo');
      });
    });

    describe('#getVerison()', () => {
      it('uses spec.version', () => {
        const spec = new PluginSpec(fooPack, {
          version: 'bar'
        });

        expect(spec.getVersion()).toBe('bar');
      });

      it('defaults to pack.pkg.version', () => {
        const spec = new PluginSpec(fooPack, {});

        expect(spec.getVersion()).toBe('kibana');
      });
    });

    describe('#isEnabled()', () => {
      describe('spec.isEnabled is not defined', () => {
        function setup(configPrefix, configGetImpl) {
          const spec = new PluginSpec(fooPack, { configPrefix });
          const config = {
            get: sinon.spy(configGetImpl),
            has: sinon.stub()
          };

          return { spec, config };
        }

        it('throws if not passed a config service', () => {
          const { spec } = setup('a.b.c', () => true);

          expect(() => spec.isEnabled())
            .toThrowError('must be called with a config service');
          expect(() => spec.isEnabled(null))
            .toThrowError('must be called with a config service');
          expect(() => spec.isEnabled({ get: () => {} }))
            .toThrowError('must be called with a config service');
        });

        it('returns true when config.get([...configPrefix, "enabled"]) returns true', () => {
          const { spec, config } = setup('d.e.f', () => true);

          expect(spec.isEnabled(config)).toBe(true);
          sinon.assert.calledOnce(config.get);
          sinon.assert.calledWithExactly(config.get, ['d', 'e', 'f', 'enabled']);
        });

        it('returns false when config.get([...configPrefix, "enabled"]) returns false', () => {
          const { spec, config } = setup('g.h.i', () => false);

          expect(spec.isEnabled(config)).toBe(false);
          sinon.assert.calledOnce(config.get);
          sinon.assert.calledWithExactly(config.get, ['g', 'h', 'i', 'enabled']);
        });
      });

      describe('spec.isEnabled is defined', () => {
        function setup(isEnabledImpl) {
          const isEnabled = sinon.spy(isEnabledImpl);
          const spec = new PluginSpec(fooPack, { isEnabled });
          const config = {
            get: sinon.stub(),
            has: sinon.stub()
          };

          return { isEnabled, spec, config };
        }

        it('throws if not passed a config service', () => {
          const { spec } = setup(() => true);

          expect(() => spec.isEnabled())
            .toThrowError('must be called with a config service');
          expect(() => spec.isEnabled(null))
            .toThrowError('must be called with a config service');
          expect(() => spec.isEnabled({ get: () => {} }))
            .toThrowError('must be called with a config service');
        });

        it('does not check config if spec.isEnabled returns true', () => {
          const { spec, isEnabled, config } = setup(() => true);

          expect(spec.isEnabled(config)).toBe(true);
          sinon.assert.calledOnce(isEnabled);
          sinon.assert.notCalled(config.get);
        });

        it('does not check config if spec.isEnabled returns false', () => {
          const { spec, isEnabled, config } = setup(() => false);

          expect(spec.isEnabled(config)).toBe(false);
          sinon.assert.calledOnce(isEnabled);
          sinon.assert.notCalled(config.get);
        });
      });
    });

    describe('#getExpectedKibanaVersion()', () => {
      describe('has: spec.kibanaVersion,pkg.kibana.version,spec.version,pkg.version', () => {
        it('uses spec.kibanaVersion', () => {
          const pack = new PluginPack({
            path: '/dev/null',
            pkg: {
              name: 'expkv',
              version: '1.0.0',
              kibana: {
                version: '6.0.0'
              }
            }
          });

          const spec = new PluginSpec(pack, {
            version: '2.0.0',
            kibanaVersion: '5.0.0'
          });

          expect(spec.getExpectedKibanaVersion()).toBe('5.0.0');
        });
      });
      describe('missing: spec.kibanaVersion, has: pkg.kibana.version,spec.version,pkg.version', () => {
        it('uses pkg.kibana.version', () => {
          const pack = new PluginPack({
            path: '/dev/null',
            pkg: {
              name: 'expkv',
              version: '1.0.0',
              kibana: {
                version: '6.0.0'
              }
            }
          });

          const spec = new PluginSpec(pack, {
            version: '2.0.0',
          });

          expect(spec.getExpectedKibanaVersion()).toBe('6.0.0');
        });
      });
      describe('missing: spec.kibanaVersion,pkg.kibana.version, has: spec.version,pkg.version', () => {
        it('uses spec.version', () => {
          const pack = new PluginPack({
            path: '/dev/null',
            pkg: {
              name: 'expkv',
              version: '1.0.0',
            }
          });

          const spec = new PluginSpec(pack, {
            version: '2.0.0',
          });

          expect(spec.getExpectedKibanaVersion()).toBe('2.0.0');
        });
      });
      describe('missing: spec.kibanaVersion,pkg.kibana.version,spec.version, has: pkg.version', () => {
        it('uses pkg.version', () => {
          const pack = new PluginPack({
            path: '/dev/null',
            pkg: {
              name: 'expkv',
              version: '1.0.0',
            }
          });

          const spec = new PluginSpec(pack, {});

          expect(spec.getExpectedKibanaVersion()).toBe('1.0.0');
        });
      });
    });

    describe('#isVersionCompatible()', () => {
      it('passes this.getExpectedKibanaVersion() and arg to isVersionCompatible(), returns its result', () => {
        const spec = new PluginSpec(fooPack, { version: '1.0.0' });
        sinon.stub(spec, 'getExpectedKibanaVersion').returns('foo');
        const isVersionCompatible = sinon.stub(IsVersionCompatibleNS, 'isVersionCompatible').returns('bar');
        expect(spec.isVersionCompatible('baz')).toBe('bar');

        sinon.assert.calledOnce(spec.getExpectedKibanaVersion);
        sinon.assert.calledWithExactly(spec.getExpectedKibanaVersion);

        sinon.assert.calledOnce(isVersionCompatible);
        sinon.assert.calledWithExactly(isVersionCompatible, 'foo', 'baz');
      });
    });

    describe('#getRequiredPluginIds()', () => {
      it('returns spec.require', () => {
        const spec = new PluginSpec(fooPack, { require: [1, 2, 3] });
        expect(spec.getRequiredPluginIds()).toEqual([1, 2, 3]);
      });
    });

    describe('#getPublicDir()', () => {
      describe('spec.publicDir === false', () => {
        it('returns null', () => {
          const spec = new PluginSpec(fooPack, { publicDir: false });
          expect(spec.getPublicDir()).toBe(null);
        });
      });

      describe('spec.publicDir is falsy', () => {
        it('returns public child of pack path', () => {
          function assert(publicDir) {
            const spec = new PluginSpec(fooPack, { publicDir });
            expect(spec.getPublicDir()).toBe(resolve('/dev/null/public'));
          }

          assert(0);
          assert('');
          assert(null);
          assert(undefined);
          assert(NaN);
        });
      });

      describe('spec.publicDir is an absolute path', () => {
        it('returns the path', () => {
          const spec = new PluginSpec(fooPack, {
            publicDir: '/var/www/public'
          });

          expect(spec.getPublicDir()).toBe('/var/www/public');
        });
      });

      // NOTE: see constructor tests for other truthy-tests that throw in constructor
    });

    describe('#getExportSpecs()', () => {
      it('returns spec.uiExports', () => {
        const spec = new PluginSpec(fooPack, {
          uiExports: 'foo'
        });

        expect(spec.getExportSpecs()).toBe('foo');
      });
    });

    describe('#getPreInitHandler()', () => {
      it('returns spec.preInit', () => {
        const spec = new PluginSpec(fooPack, {
          preInit: 'foo'
        });

        expect(spec.getPreInitHandler()).toBe('foo');
      });
    });

    describe('#getInitHandler()', () => {
      it('returns spec.init', () => {
        const spec = new PluginSpec(fooPack, {
          init: 'foo'
        });

        expect(spec.getInitHandler()).toBe('foo');
      });
    });

    describe('#getConfigPrefix()', () => {
      describe('spec.configPrefix is truthy', () => {
        it('returns spec.configPrefix', () => {
          const spec = new PluginSpec(fooPack, {
            configPrefix: 'foo.bar.baz'
          });

          expect(spec.getConfigPrefix()).toBe('foo.bar.baz');
        });
      });
      describe('spec.configPrefix is falsy', () => {
        it('returns spec.getId()', () => {
          function assert(configPrefix) {
            const spec = new PluginSpec(fooPack, { configPrefix });
            sinon.stub(spec, 'getId').returns('foo');
            expect(spec.getConfigPrefix()).toBe('foo');
            sinon.assert.calledOnce(spec.getId);
          }

          assert(false);
          assert(null);
          assert(undefined);
          assert('');
          assert(0);
        });
      });
    });

    describe('#getConfigSchemaProvider()', () => {
      it('returns spec.config', () => {
        const spec = new PluginSpec(fooPack, {
          config: 'foo'
        });

        expect(spec.getConfigSchemaProvider()).toBe('foo');
      });
    });

    describe('#readConfigValue()', () => {
      const spec = new PluginSpec(fooPack, {
        configPrefix: 'foo.bar'
      });

      const config = {
        get: sinon.stub()
      };

      afterEach(() => config.get.reset());

      describe('key = "foo"', () => {
        it('passes key as own array item', () => {
          spec.readConfigValue(config, 'foo');
          sinon.assert.calledOnce(config.get);
          sinon.assert.calledWithExactly(config.get, ['foo', 'bar', 'foo']);
        });
      });

      describe('key = "foo.bar"', () => {
        it('passes key as two array items', () => {
          spec.readConfigValue(config, 'foo.bar');
          sinon.assert.calledOnce(config.get);
          sinon.assert.calledWithExactly(config.get, ['foo', 'bar', 'foo', 'bar']);
        });
      });

      describe('key = ["foo", "bar"]', () => {
        it('merged keys into array', () => {
          spec.readConfigValue(config, ['foo', 'bar']);
          sinon.assert.calledOnce(config.get);
          sinon.assert.calledWithExactly(config.get, ['foo', 'bar', 'foo', 'bar']);
        });
      });
    });

    describe('#getDeprecationsProvider()', () => {
      it('returns spec.deprecations', () => {
        const spec = new PluginSpec(fooPack, {
          deprecations: 'foo'
        });

        expect(spec.getDeprecationsProvider()).toBe('foo');
      });
    });
  });
});
