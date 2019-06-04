const logger = require('./logger');

export function run(f) {
  f().then(function () {
    process.exit(0);
  }).catch(function (e) {
    logger.error('Error encountered:', e);
    process.exit(1);
  });
}
