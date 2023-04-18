/* eslint-disable */
import * as nlon from '@elementbound/nlon'
import Room from '../../domain/room.mjs'
import User from '../../domain/user.mjs'
/* eslint-enable */
import assert from 'node:assert'
import { getLogger } from '../../logger.mjs'
import { ajv } from '../ajv.mjs'
import { participationRepository } from '../rooms/participation.repository.mjs'
import { userRepository } from '../users/user.repository.mjs'
import { requireAuthorization, requireBody, requireLogin, requireLoginRoom, requireSchema } from '../validators.mjs'

/**
* @param {nlon.Server} server
*/
export default function handleSpectator (server) {
  ajv.addSchema({
    type: 'object',
    properties: {
      target: { type: 'string' },
      isSpectator: { type: 'boolean' }
    }
  }, 'schema/room/spectator')

  server.handle('room/spectator', async (peer, corr) => {
    const request = await corr.next(
      requireBody(),
      requireSchema('schema/room/spectator'),
      requireAuthorization(),
      requireLogin(),
      requireLoginRoom()
    )

    /** @type {User} */
    const user = corr.context.user
    /** @type {Room} */
    const room = corr.context.room
    /** @type {string} */
    const targetId = request.target
    /** @type {boolean} */
    const isSpectator = request.isSpectator

    const logger = getLogger({
      name: 'spectatorRequestHandler',
      room: room.id,
      user: user.id,
      target: targetId,
      isSpectator
    })

    logger.info('Spectator change request')

    // Validate
    const target = userRepository.find(targetId)
    assert(target, 'Unknown target user!')

    assert(
      participationRepository.isUserInRoom(target.id, room.id),
      'Trying to make someone spectator in another room!'
    )

    assert(
      user.isAdmin || target.id === user.id,
      'User is not admin, and not applying to self!'
    )

    // Update the target
    logger.info('Updating target\'s spectator flag')
    target.isSpectator = isSpectator

    // Broadcast change
    logger.info('Sending spectator notification')
    // TODO: Broadcast
  })
}
