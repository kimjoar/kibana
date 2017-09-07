import { KibanaPluginConfig, KibanaRequest } from 'kbn-types';
import { SavedObjectsService } from './SavedObjectsService';
import { registerEndpoints } from './registerEndpoints';

export const plugin: KibanaPluginConfig<{}> = {
  plugin: kibana => {
    const { kibana: _kibana, elasticsearch, logger, http } = kibana;
  
    const log = logger.get();
  
    log.info('creating savedObjects plugin');
  
    const router = http.createAndRegisterRouter('/api/saved_objects');
  
    const createSavedObjectsService = (req: KibanaRequest) =>
      new SavedObjectsService(
        elasticsearch.service.getClusterOfType$('admin', req),
        _kibana.config$
      );
  
    registerEndpoints(router, logger, createSavedObjectsService);
  }
}
