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
import { roomService } from '../rooms/room.service.mjs'

/**
* @param {nlon.Server} server
*/
export function handleKick (server) {
  ajv.addSchema({
    type: 'object',
    properties: {
      target: { type: 'string' }
    }
  }, 'schema/room/kick')

  server.handle('room/kick', async (_peer, corr) => {
    const request = await corr.next(
      requireBody(),
      requireSchema('schema/room/kick'),
      requireAuthorization(),
      requireLogin(),
      requireLoginRoom()
    )

    /** @type {Room} */
    const room = corr.context.room
    /** @type {User} */
    const user = corr.context.user
    /** @type {string} */
    const targetId = request.target

    const target = userRepository.find(targetId)

    const logger = getLogger({
      room: room.id,
      user: user.id,
      target: targetId
    })

    logger.info('User requesting kick')

    // Validate request
    assert(target, 'Trying to kick unknown user!')
    assert(user.isAdmin, 'User is not admin!')
    assert(user.id !== target.id, 'User trying to kick self!')
    assert(
      participationRepository.findUserRoom(target.id) === room.id,
      'Trying to kick user in a different room!'
    )

    // Remove user
    logger.info('Removing target from room')
    roomService.leaveRoom(room, target)

    corr.finish()
  })
}
