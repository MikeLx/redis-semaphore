const debug = require('debug')('redis-semaphore:mutex:acquire')
const delay = require('../utils/delay')

async function acquireMutex(
  client,
  key,
  identifier,
  lockTimeout = 10000,
  acquireTimeout = 10000,
  retryInterval = 10
) {
  const end = Date.now() + acquireTimeout
  while (Date.now() < end) {
    debug(key, identifier, 'attempt')
    let result = await client.setAsync(
      key,
      identifier,
      'NX',
      'PX',
      lockTimeout
    )
    if (Buffer.isBuffer(result)) {
      result = new Buffer(result).toString();
    }
    debug('result', typeof result, result)
    if (result === 'OK') {
      debug(key, identifier, 'acquired')
      return true
    } else {
      await delay(retryInterval)
    }
  }
  debug(key, identifier, 'timeout')
  return false
}

module.exports = acquireMutex
