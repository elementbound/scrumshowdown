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
export default function handleTopic (server) {
  ajv.addSchema({
    type: 'string'
  }, 'schema/room/topic')

  server.handle('room/topic', async (peer, corr) => {
    const request = await corr.next(
      requireBody(),
      requireSchema('schema/room/topic'),
      requireAuthorization(),
      requireLogin(),
      requireLoginRoom()
    )

    /** @type {string} */
    const topic = request

    /** @type {User} */
    const user = corr.context.user
    /** @type {Room} */
    const room = corr.context.room

    const logger = getLogger({
      name: 'topicHandler',
      room: room.id,
      user: user.id,
      topic
    })

    logger.info('Updating room topic')

    // Update room
    room.topic = topic

    // Send notification
    logger.info('Sending topic change notification')
    // roomService.broadcast(room, updateTopic(room.topic)) // TODO: Notification service?

    corr.finish()
  })
}
