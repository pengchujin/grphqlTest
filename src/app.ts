import { createConnection } from 'typeorm';
import * as express from 'express';
import * as cors from 'cors';
import * as multer from 'multer';
import * as requestIp from 'request-ip';
import * as process from 'process';
import * as fs from 'fs';
import * as bodyParser from 'body-parser';
const xmlparser = require('express-xml-bodyparser');
import { altairExpress } from 'altair-express-middleware';
import { graphqlExpress } from 'apollo-server-express';
global.Promise = require('bluebird');
import * as config from '../config';
import { schema } from './schema';
const logger = require('./logger');

const upload = multer({ dest: config.IMAGEFILE });

(async () => {
  // createConnection method will automatically read connection options from your ormconfig file
  const db = await createConnection();

  const app = express();
  app.use(cors());
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

  app.post('/upload', upload.single('file'), async (req, res) => {
    try {
      console.log(req['file']);
      fs.rename(req['file'].path, config.IMAGEFILE + req['file'].originalname, function(err) {
        if (err) {
            throw err;
        }
        console.log('上传成功!');
    });
    } catch (err) {
        res.sendStatus(400);
    }
    res.send({
      status: true,
      file: req['file'].originalname
    });
})

  const path = '/graphql';

  const environment = process.env.NODE_ENV || 'development';
  if (environment === 'development') {
    app.use('/altair', altairExpress({ endpointURL: path }));
  }
  app.get('/status', (req, res) => {
    res.send('OK!');
  });

  const port =
    process.env.NOMAD_PORT_http || process.env.PORT || config.ADMIN_PORT || 3001;
  const ip = process.env.NOMAD_IP_http || '0.0.0.0';

  app.listen({ port, ip }, () =>
    logger.info(`App running on port: ${port} at: ${ip}`)
  );
  if (environment === 'production') {
    process.send('ready');
  }
})();
