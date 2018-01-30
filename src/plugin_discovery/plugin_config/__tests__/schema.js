import { PluginPack } from '../../plugin_pack';
import { getSchema, getStubSchema } from '../schema';

describe('plugin discovery/schema', () => {
  function createPluginSpec(configProvider) {
    return new PluginPack({
      path: '/dev/null',
      pkg: {
        name: 'test',
        version: 'kibana',
      },
      provider: ({ Plugin }) => new Plugin({
        configPrefix: 'foo.bar.baz',
        config: configProvider,
      }),
    })
      .getPluginSpecs()
      .pop();
  }

  describe('getSchema()', () => {
    it('calls the config provider and returns its return value', async () => {
      const pluginSpec = createPluginSpec(() => 'foo');
      expect(await getSchema(pluginSpec)).toBe('foo');
    });

    it('supports config provider that returns a promise', async () => {
      const pluginSpec = createPluginSpec(() => Promise.resolve('foo'));
      expect(await getSchema(pluginSpec)).toBe('foo');
    });

    it('uses default schema when no config provider', async () => {
      const schema = await getSchema(createPluginSpec());
      expect(typeof schema).toBe('object');
      expect(typeof schema.validate).toBe('function');
      expect(schema.validate({}).value).toEqual({
        enabled: true
      });
    });

    it('uses default schema when config returns falsy value', async () => {
      const schema = await getSchema(createPluginSpec(() => null));
      expect(typeof schema).toBe('object');
      expect(typeof schema.validate).toBe('function');
      expect(schema.validate({}).value).toEqual({
        enabled: true
      });
    });

    it('uses default schema when config promise resolves to falsy value', async () => {
      const schema = await getSchema(createPluginSpec(() => Promise.resolve(null)));
      expect(typeof schema).toBe('object');
      expect(typeof schema.validate).toBe('function');
      expect(schema.validate({}).value).toEqual({
        enabled: true
      });
    });
  });

  describe('getStubSchema()', () => {
    it('returns schema with enabled: false', async () => {
      const schema = await getStubSchema();
      expect(typeof schema).toBe('object');
      expect(typeof schema.validate).toBe('function');
      expect(schema.validate({}).value).toEqual({
        enabled: false
      });
    });
  });
});
