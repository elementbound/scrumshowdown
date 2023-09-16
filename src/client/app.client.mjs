import * as nlon from '@elementbound/nlon'
import * as events from 'node:events'
import { WebSocketStream } from "@elementbound/nlon-websocket";
import { rootLogger } from "../logger.mjs";
import { pino } from 'pino';

export class AppClient extends events.EventEmitter {
  /** @type {pino.Logger} */
  #logger = rootLogger()
  /** @type {nlon.Server} */
  #nlons = undefined

  #auth = ''

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
        this.#nlons = nlons
        this.configure(nlons)
        resolve(nlons)
      })

      ws.addEventListener('error', err => {
        this.#logger.error({ err }, 'Connection failed to host %s', address)
        reject(err)
      }, { once: true })
    })
  }

  async join (roomId, profile) {
    this.#logger.info({ profile, roomId }, 'Joining room')
    const corr = this.peer.send(new nlon.Message({
      header: new nlon.MessageHeader({
        subject: 'room/join'
      }),
      body: {
        roomId,
        profile
      }
    }))

    const user = await corr.next()
    corr.finish()

    this.#auth = user.id
    this.emit('accept', user)
  }

  updateState (ready, emote) {
    this.peer.send(new nlon.Message({
      header: new nlon.MessageHeader({
        subject: 'room/state',
        authorization: this.#auth
      }),
      body: {
        isReady: ready,
        emote
      }
    }))
  }

  updateTopic (topic) {
    this.peer.send(new nlon.Message({
      header: new nlon.MessageHeader({
        subject: 'room/topic',
        authorization: this.#auth
      }),
      body: {
        topic
      }
    })).finish()
  }

  requestEstimates () {
    this.peer.send(new nlon.Message({
      header: new nlon.MessageHeader({
        subject: 'room/estimate',
        authorization: this.#auth
      })
    })).finish()
  }

  kick (target) {
    this.peer.send(new nlon.Message({
      header: new nlon.MessageHeader({
        subject: 'room/kick',
        authorization: this.#auth
      }),
      body: {
        target
      }
    })).finish()
  }

  promote (target) {
    this.peer.send(new nlon.Message({
      header: new nlon.MessageHeader({
        subject: 'room/promote',
        authorization: this.#auth
      }),
      body: {
        target
      }
    })).finish()
  }

  spectator (target, enabled) {
    this.peer.send(new nlon.Message({
      header: new nlon.MessageHeader({
        subject: 'room/spectator',
        authorization: this.#auth
      }),
      body: {
        target,
        isSpectator: enabled
      }
    })).finish()
  }

  /**
  * Configure nlon server with event handlers.
  * @param {nlon.Server} nlons nlon server
  */
  configure (nlons) {
    nlons.handle('room/update/join', async (_peer, corr) => {
      const { user } = await corr.next()
      this.emit('join', user)
      corr.finish()
    })

    nlons.handle('room/update/leave', async (_peer, corr) => {
      const { user } = await corr.next()
      this.emit('leave', user)
      corr.finish()
    })

    nlons.handle('room/gather/estimation', async (_peer, corr) => {
      let estimate
      const supplier = v => estimate = v

      this.emit('estimate', supplier)
      if (estimate === undefined) {
        throw Error('No estimate supplied!')
      }

      corr.finish({
        estimate
      })
    })

    nlons.handle('room/update/estimation', async (_peer, corr) => {
      const estimation = await corr.next()
      corr.finish()

      this.emit('estimation', estimation)
    })

    nlons.handle('room/update/state', async (_peer, corr) => {
      // TODO: Response validation
      const state = await corr.next()
      console.log(state)
      this.emit('state', state)
      corr.finish()
    })

    nlons.handle('room/update/topic', async (_peer, corr) => {
      // TODO: Response validation
      const { topic } = await corr.next()
      this.emit('topic', topic)
      corr.finish()
    })

    nlons.handle('room/update/kick', (_peer, corr) => {
      corr.finish()
      this.emit('kick')
    })

    nlons.handle('room/update/promote', async (_peer, corr) => {
      const { target } = await corr.next()
      this.emit('promote', target)
      corr.finish()
    })

    nlons.handle('room/update/spectator', async (_peer, corr) => {
      const data = await corr.next()
      const { target, isSpectator } = data
      this.emit('spectator', target, isSpectator)
      corr.finish()
    })
  }

  /** @type {nlon.Server} */
  get server () {
    return this.#nlons
  }

  /** @type {nlon.Peer} */
  get peer () {
    return this.#nlons.peers[0]
  }
}
