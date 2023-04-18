/* eslint-disable */
import * as nlon from '@elementbound/nlon'
import Room from '../../domain/room.mjs'
import User from '../../domain/user.mjs'
/* eslint-enable */
import { getLogger } from '../../logger.mjs'
import { ajv } from '../ajv.mjs'
import { requireAuthorization, requireBody, requireLogin, requireLoginRoom, requireSchema } from '../validators.mjs'

/**
* @param {nlon.Server} server
*/
export function handleState (server) {
  ajv.addSchema({
    type: 'object',
    properties: {
      isReady: { type: 'boolean' },
      emote: { type: 'string' }
    }
  }, 'schema/room/state')

  server.handle('room/state', async (peer, corr) => {
    const request = await corr.next(
      requireBody(),
      requireSchema('schema/room/state'),
      requireAuthorization(),
      requireLogin(),
      requireLoginRoom()
    )

    /** @type {User} */
    const user = corr.context.user
    /** @type {Room} */
    const room = corr.context.room

    const { isReady, emote } = request

    const logger = getLogger({
      name: 'stateHandler',
      room: room?.id,
      user: user?.id,
      isReady,
      emote
    })

    logger.info('User requesting to change state')
    user.isReady = isReady
    user.emote = emote

    logger.info('Sending state change notification')
    // roomService.broadcast(room, stateChange(user, isReady, emote)) // TODO
  })
}