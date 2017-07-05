import { Schema, typeOfSchema } from '../../types';

const createWorkspacesSchema = (schema: Schema) =>
  schema.object({
    enabled: schema.boolean({
      defaultValue: true
    })
  });

const workspacesConfigType = typeOfSchema(createWorkspacesSchema);
type WorkspacesConfigType = typeof workspacesConfigType;

export class WorkspacesConfig {
  static createSchema = createWorkspacesSchema;

  enabled: boolean;

  constructor(config: WorkspacesConfigType) {
    this.enabled = config.enabled;
  }
}
