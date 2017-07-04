import { Observable } from 'rxjs';

import { KibanaPlugin } from '../../server/plugins/types';
import { KibanaPluginFeatures } from '../../types';
import { Logger } from '../../logger'
import { Root } from '../../root'
import { WorkspacesConfig } from './WorkspacesConfig';

export const configPath = ['xpack', 'workspaces'];

export const dependencies = [];

type WorkspaceId = string;

export const plugin = class implements KibanaPlugin<void> {
  log: Logger;
  kibanaInstances: Map<WorkspaceId, Root>;
  config$: Observable<WorkspacesConfig>;

  constructor(readonly kibana: KibanaPluginFeatures) {
    this.log = kibana.logger.get();

    this.config$ = kibana.config.create(WorkspacesConfig);
  }

  start() {
    this.log.info('starting workspaces');

    this.kibanaInstances = new Map([
      ['1', this.createInstance()],
      ['2', this.createInstance()],
      ['3', this.createInstance()]
    ]);

    const router = this.kibana.http.createAndRegisterRouter('/ws', {});

    for (const [, instance] of this.kibanaInstances) {
      instance.start();
    }

    router.unstable_raw()
      .all('/:type/*', (req, res) => {
        const type = req.params['type'];
        const kibanaInstance = this.kibanaInstances.get(type);

        if (kibanaInstance === undefined) {
          return res.status(404).send();
        }

        req.url = req.url.slice(type.length + 1);
        kibanaInstance.unstable_handleRequest(req, res);
      });

    this.log.info('workspaces started');
  }

  createInstance() {
    return this.kibana.core.createKibanaInstance({
      server: {
        autoListen: false
      },

      // we must ensure plugins that have "global" state/effects are disabled
      xpack: {
        workspaces: {
          enabled: false
        }
      },
      pid: {
        enabled: false
      }
    }, () => {
      this.log.info('workspace Kibana was stopped');
    });
  }

  stop() {
    if (this.kibanaInstances.size > 0) {
      this.log.info('stopping workspaces');
      this.kibanaInstances.forEach(instance => instance.shutdown());
    }
  }
}
