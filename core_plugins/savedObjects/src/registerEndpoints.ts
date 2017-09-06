import { Router, LoggerFactory, Schema } from 'kbn-types';
import { SavedObjectsService } from './SavedObjectsService';

export function registerEndpoints(
  router: Router<SavedObjectsService>,
  logger: LoggerFactory,
  schema: Schema
) {
  const { object, string, number, maybe } = schema;
  const log = logger.get('routes');

  router.get(
    {
      path: '/fail'
    },
    async (savedObjectsService, req, res) => {
      log.info(`GET should fail`);

      return res.badRequest(new Error('nope'));
    }
  );

  const getUiSettingsService = req => new getUiSettingsService(savedObjectsClient(req));
  const savedObjectsClient = req => new savedObjectsClient(req);

  router.get(
    {
      path: '/:type',
      pre: {
        getUiSettingsService
      },
      validate: {
        params: object({
          type: string()
        }),
        query: object({
          page: maybe(
            number({
              min: 1
            })
          ),
          per_page: maybe(
            number({
              min: 1
            })
          )
        })
      }
    },
    async (savedObjectsService, req, res) => {
      const cluster = getCluster(req, 'admin');
      const uiSettingService = getUiSettingsService(cluster);

      const { params, query, headers } = req;

      const savedObjects = await savedObjectsService.find({
        type: params.type,
        page: query.page,
        perPage: query.per_page
      });

      return res.ok(savedObjects);
      // if 200 OK we can simplify to just:
      // return savedObjects;
    }
  );
}
