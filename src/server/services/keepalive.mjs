import * as ws from 'ws'
import assert from 'node:assert'

function time () {
  return +new Date()
}

function sleep (interval) {
  return new Promise(resolve => setTimeout(resolve, interval))
}

/**
* Sends a ping frame periodically and reject if the client doesn't answer for
* too long.
*
* @param {ws.WebSocket} ws WebSocket
* @param {number} interval Interval for ping
* @param {number} timeout Timeout
*/
export async function keepAlive (ws, interval, timeout) {
  let lastPong = time()
  ws.on('pong', () => {
    lastPong = time()
  })

  while (true) {
    assert(
      time() - lastPong < timeout,
      'WebSocket connection timed out!'
    )

    ws.ping()
    await sleep(interval)
  }
}
