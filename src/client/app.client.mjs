import * as nlon from '@elementbound/nlon'
import * as events from 'node:events'
import { WebSocketStream } from "@elementbound/nlon-websocket";
import { rootLogger } from "../logger.mjs";

export class AppClient extends events.EventEmitter {
  #logger = rootLogger()

  /**
  * Connect to ScrumShowdown API at address.
  * @param {string} address API host address
  * @returns {Promise<nlon.Server>} Connected nlon server
  */
  connect (address) {
    return new Promise((resolve, reject) => {
      this.#logger.info(`Connecting to host ${address}`)

      const ws = new WebSocket(address)
      const nlons = new nlon.Server()
      ws.addEventListener('open', () => {
        this.#logger.info(`Connection successful to host ${address}`)

        const wss = new WebSocketStream(ws)
        nlons.connect(wss)

        this.#logger.info('Listening on nlon server')
        resolve(nlons)
      })

      ws.addEventListener('error', err => {
        this.#logger.error({ err }, 'Connection failed to host %s', address)
        reject(err)
      }, { once: true })
    })
  }

  /**
  * Configure nlon server with event handlers.
  * @param {nlon.Server} nlons nlon server
  */
  configure (nlons) {
    nlons.handle('room/update/spectator', corr => {
      this.emit('spectator') // TODO
    })

    nlons.handle('room/update/topic', corr => {
      this.emit('topic') // TODO
    })

    nlons.handle('room/update/state', corr => {
      this.emit('state') // TODO
    })

    nlons.handle('room/update/promote', corr => {
      this.emit('promote') // TODO
    })

    nlons.handle('room/update/estimation', corr => {
      this.emit('estimation') // TODO
    })
  }
}
