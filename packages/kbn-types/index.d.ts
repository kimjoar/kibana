declare module 'kbn-types' {
  import { Observable } from 'rxjs';

  namespace Schema {
    type Any = Setting<any>;
    type TypeOf<RT extends Any> = RT['_type'];

    type SettingOptions<T> = {
      defaultValue?: T;
      validate?: (value: T) => string | void;
    };

    abstract class Setting<V> {
      readonly _type: V;
      validate(value: any, context?: string): V;
    }

    type StringOptions = SettingOptions<string> & {
      minLength?: number;
      maxLength?: number;
    };

    interface Schema {
      boolean(options?: SettingOptions<boolean>): Setting<boolean>;
      string(options?: StringOptions): Setting<string>;
    }
  }

  export interface Logger {
    trace(message: string, meta?: { [key: string]: any }): void;
    debug(message: string, meta?: { [key: string]: any }): void;
    info(message: string, meta?: { [key: string]: any }): void;
    warn(errorOrMessage: string | Error, meta?: { [key: string]: any }): void;
    error(errorOrMessage: string | Error, meta?: { [key: string]: any }): void;
    fatal(errorOrMessage: string | Error, meta?: { [key: string]: any }): void;
  }

  export interface LoggerFactory {
    get(...namespace: string[]): Logger;
  }

  interface ElasticsearchService {}

  interface ElasticsearchConfigs {}
  interface KibanaConfig {}
  interface RouterOptions<T> {}
  interface Router<T> {}
  interface Env {}

  export interface ConfigWithSchema<S extends Schema.Any, Config> {
    /**
     * Any config class must define a schema that validates the config, based on
     * the injected `schema` helper.
     */
    createSchema: (schema: Schema.Schema) => S;

    /**
     * @param validatedConfig The result from calling the static `createSchema`
     * above. This config is validated before the config class is instantiated.
     * @param env An instance of the `Env` class that defines environment specific
     * variables.
     */
    new (validatedConfig: Schema.TypeOf<S>, env: Env): Config;
  }

  export interface KibanaPluginFeatures {
    /**
     * Plugin-scoped logger
     */
    logger: LoggerFactory;

    /**
     * Core Kibana utilities
     */
    util: {
      schema: Schema.Schema;
    };

    /**
     * Core Elasticsearch functionality
     */
    elasticsearch: {
      service: ElasticsearchService;
      config$: Observable<ElasticsearchConfigs>;
    };
    kibana: {
      config$: Observable<KibanaConfig>;
    };

    /**
     * Core HTTP functionality
     */
    http: {
      /**
       * Create and register a router at the specified path.
       *
       * The return value of the `onRequest` router option will be injected as the
       * first param in any route handler registered on the router.
       */
      createAndRegisterRouter: <T>(
        path: string,
        options: RouterOptions<T>
      ) => Router<T>;
    };

    /**
     * Core configuration functionality, enables fetching a subset of the config.
     */
    config: {
      /**
       * Reads the subset of the config at the specified `path` and validates it
       * against the schema created by calling the static `createSchema` on the
       * specified `ConfigClass`.
       *
       * @param path The path to the desired subset of the config.
       * @param ConfigClass A class (not an instance of a class) that contains a
       * static `createSchema` that will be called to create a schema that we
       * validate the config at the given `path` against.
       */
      create: <S extends Schema.Any, Config>(
        ConfigClass: ConfigWithSchema<S, Config>
      ) => Observable<Config>;
      createIfExists: <S extends Schema.Any, Config>(
        ConfigClass: ConfigWithSchema<S, Config>
      ) => Observable<Config | undefined>;
    };
  }

  interface BasePluginsType {
    [key: string]: any;
  }

  export type KibanaFunctionalPlugin<
    DependenciesType extends BasePluginsType,
    ExposableType = void
  > = (kibana: KibanaPluginFeatures, plugins: DependenciesType) => ExposableType;
}