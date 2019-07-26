import * as bcrypt from 'bcrypt';
import * as process from 'process';
import { createConnection } from 'typeorm';
import * as config from '../../config';
const logger = require('../logger');
import { run } from '../runner';
import { Vip } from '../entity/vip';

run(async () => {
  const db = await createConnection();

  const username = process.argv[2];
  const password = process.argv[3];

  const encryptedPassword = await bcrypt.hash(password, Number(config.SALT_ROUNDS));

  const repository = db.getRepository(Vip);
  const vip = repository.create({
    username,
    encryptedPassword
  });
  await repository.save(vip);

  logger.info('Created!');
});
