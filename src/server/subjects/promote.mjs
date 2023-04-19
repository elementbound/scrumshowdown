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
export function handlePromote (server) {
  ajv.addSchema({
    type: 'object',
    properties: {
      target: { type: 'string' }
    }
  }, 'schema/room/promote')

  server.handle('room/promote', async (_peer, corr) => {
    const request = await corr.next(
      requireBody(),
      requireSchema('schema/room/promote'),
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
      name: 'promoteRequestHandler',
      room: room.id,
      user: user.id,
      target: targetId
    })

    logger.info('User requesting to promote another')

    assert(target, 'Trying to promote unknown user!')
    assert(user.isAdmin, 'User has no right to promote!')
    assert(user.id === target.id, 'User is trying to promote self!')
    assert(
      participationRepository.isUserInRoom(target.id, room.id),
      'Target is not in the room!'
    )

    // Promote
    logger.info('Promoting to admin')
    target.isAdmin = true

    // Broadcast
    logger.info('Sending promote notification')
    // TODO: Broadcast
  })
}
