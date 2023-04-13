/* eslint-disable */
import * as nlon from '@elementbound/nlon'
import Room from '../../domain/room.mjs'
import User from '../../domain/user.mjs'
/* eslint-enable */
import assert from 'node:assert'
import { getLogger } from '../../logger.mjs'
import { ajv } from '../ajv.mjs'
import { requireAuthorization, requireBody, requireLogin, requireSchema } from '../validators.mjs'
import { participationRepository } from '../rooms/participation.repository.mjs'
import { roomRepository } from '../rooms/room.repository.mjs'

/**
* @param {nlon.Server} server
*/
export default function handleTopic (server) {
  ajv.addSchema({
    type: 'string'
  }, 'schema/room/topic')

  server.handle('room/topic', async (peer, corr) => {
    const request = await corr.next(
      requireBody(),
      requireSchema('schema/room/topic'),
      requireAuthorization(),
      requireLogin()
    )

    /** @type {string} */
    const topic = request

    const user = corr.context.user
    const roomId = participationRepository.findUserRoom(user.id)
    const room = roomRepository.find(roomId)
    const logger = getLogger({
      name: 'topicHandler',
      room: roomId,
      user: user.id,
      topic
    })

    logger.info('Updating room topic')
    assert(room, 'Unknown room!')

    // Update room
    room.topic = topic

    // Send notification
    logger.info('Sending topic change notification')
    // roomService.broadcast(room, updateTopic(room.topic)) // TODO: Notification service?

    corr.finish()
  })
}
