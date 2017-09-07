import { Router, LoggerFactory, KibanaRequest } from 'kbn-types';
import { SavedObjectsService } from './SavedObjectsService';

export function registerEndpoints(
  router: Router<SavedObjectsService>,
  logger: LoggerFactory,
  savedObjectsService: (req: KibanaRequest) => SavedObjectsService
) {
  router.route(
    {
      method: 'GET',
      path: '/:type',
      pre: {
        savedObjectsService
      },
      validate: ({ object, string, number, maybe }) => ({
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
      })
    },
    async (req, res, values) => {
      const { params, query } = req;
      const { savedObjectsService } = values;

      const savedObjects = await savedObjectsService.find({
        type: params.type,
        page: query.page,
        perPage: query.per_page
      });

      return res.ok(savedObjects);
    }
  );
}
