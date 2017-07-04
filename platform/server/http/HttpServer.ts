import * as express from 'express';
import * as http from 'http';

import { Router } from './Router';
import { HttpConfig } from './HttpConfig';
import { Logger, LoggerFactory } from '../../logger';

export class HttpServer {
  private readonly app: express.Application;
  private readonly httpServer: http.Server;
  private readonly log: Logger;

  constructor(logger: LoggerFactory) {
    this.log = logger.get('http', 'server');
    this.app = express();
    this.httpServer = http.createServer(this.app);
  }

  isListening() {
    return this.httpServer.listening;
  }

  registerRouter(router: Router<any>) {
    this.app.use(router.path, router.router);
  }

  start(config: HttpConfig) {
    const { port, host, autoListen } = config;

    return new Promise((resolve, reject) => {
      if (!autoListen) {
        this.log.info(`http server is created, but not started, as autoListen is disabled`);
        return resolve();
      }

      this.log.info(`starting http server [${host}:${port}]`);

      this.httpServer.listen(port, host, (err?: Error) => {
        if (err != null) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  stop() {
    this.httpServer.close();
  }

  /**
   * "Proxies" request to an instance of the http server.
   */
  unstable_handleRequest(req: any, res: any) {
    this.app(req, res);
  }
}
