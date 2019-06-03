import { createConnection } from 'typeorm';
import * as express from 'express';
import * as requestIp from 'request-ip';
import * as process from 'process';
import * as bodyParser from 'body-parser';
const xmlparser = require('express-xml-bodyparser');
import { altairExpress } from 'altair-express-middleware';
import { graphqlExpress } from 'apollo-server-express';
global.Promise = require('bluebird');
import * as config from '../config';
import { schema } from './schema';
const logger = require('./logger');

(async () => {
  // createConnection method will automatically read connection options from your ormconfig file
  const db = await createConnection();

  const app = express();
  app.use(requestIp.mw());
  app.use(xmlparser({ ignoreAttrs: true, explicitArray: false }));
  app.use(
    '/graphql',
    bodyParser.json(),
    graphqlExpress((req) => {
      return {
        schema,
        context: {
          db: db,
          jwt: req.headers.authorization,
        }
      };
    })
  );

  const path = '/graphql';

  const environment = process.env.NODE_ENV || 'development';
  if (environment === 'development') {
    app.use('/altair', altairExpress({ endpointURL: path }));
  }
  app.get('/status', (req, res) => {
    res.send('OK!');
  });

  const port =
    process.env.NOMAD_PORT_http || process.env.PORT || config.PORT || 3001;
  const ip = process.env.NOMAD_IP_http || '0.0.0.0';

  app.listen({ port, ip }, () =>
    logger.info(`App running on port: ${port} at: ${ip}`)
  );
  if (environment === 'production') {
    process.send('ready');
  }
})();
