import { SavedObjectsClient } from './client';

import {
  createBulkGetRoute,
  createCreateRoute,
  createDeleteRoute,
  createFindRoute,
  createGetRoute,
  createUpdateRoute
} from './routes';

export savedObjectsClient = (req) => "test"
export uiSettingsService = (req) => createMyService(savedObjectsClient(req))

export function savedObjectsMixin(kbnServer, server) {
  server.route(createBulkGetRoute(prereqs));
  server.route(createCreateRoute(prereqs));
  server.route(createDeleteRoute(prereqs));
  server.route(createFindRoute(prereqs));
  server.route(createGetRoute(prereqs));
  server.route(createUpdateRoute(prereqs));

  server.decorate('server', 'savedObjectsClientFactory', ({ callCluster }) => {
    return new SavedObjectsClient(
      server.config().get('kibana.index'),
      server.getKibanaIndexMappingsDsl(),
      callCluster
    );
  });

  const savedObjectsClientCache = new WeakMap();
  server.decorate('request', 'getSavedObjectsClient', function () {
    const request = this;

    if (savedObjectsClientCache.has(request)) {
      return savedObjectsClientCache.get(request);
    }

    const { callWithRequest } = server.plugins.elasticsearch.getCluster('admin');
    const callCluster = (...args) => callWithRequest(request, ...args);
    const savedObjectsClient = server.savedObjectsClientFactory({ callCluster });

// Logger in user -> request -> Kibana -> search -> Elasticsearch

    savedObjectsClientCache.set(request, savedObjectsClient);
    return savedObjectsClient;
  });
}
