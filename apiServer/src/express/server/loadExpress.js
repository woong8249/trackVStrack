/* eslint-disable no-unused-vars */
import {} from 'express-async-errors';
import path from 'path';

import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import swaggerUI from 'swagger-ui-express';
import useragent from 'express-useragent';
import yaml from 'yamljs';

import artistRouter from '../routes/artist.js';
import config from '../../config/config.js';
import trackRouter from '../routes/track.js';
import winLogger from '../../util/winston.js';

const { node: { nodeEnv } } = config;
const morganOpt = nodeEnv === 'production' ? 'tiny' : 'dev';

export default function loadExpress() {
  // not yet cookie parse,helmet,cors option
  const app = express();
  if (nodeEnv === 'dev') {
    const openApiDoc = yaml.load(path.join(__dirname, '../../../openAPI.yaml'));
    app.use('/apidoc', swaggerUI.serve, swaggerUI.setup(openApiDoc));
  }
  app.use(cors());
  app.use(morgan(morganOpt));
  app.use(useragent.express());
  app.use(express.json());
  app.use('/artist', artistRouter);
  app.use('/track', trackRouter);
  app.use((_req, res) => res.status(404).json({ message: 'path does not exist' }));
  app.use((err, _req, res, _next) => {
    winLogger.error(err);
    res.status(500).json({ message: 'sorry, something is wrong' });
  });
  const server = app.listen(config.node.nodePort, () => winLogger.info('Server is ready', { address: server.address() }));
  if (import.meta.hot) {
    import.meta.hot.on('vite:beforeFullReload', () => {
      server.close();
    });
  }
  return { server };
}
