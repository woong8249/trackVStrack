import path from 'path';

import swaggerUI from 'swagger-ui-express';
import yaml from 'yamljs';

export default function addAPIDoc(app) {
  const openApiDoc = yaml.load(path.join(__dirname, '../../../openAPI.yaml'));
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(openApiDoc));
}
