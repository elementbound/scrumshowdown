/* eslint-disable */
import * as nlon from '@elementbound/nlon'
import Room from '../../domain/room.mjs'
import User from '../../domain/user.mjs'
/* eslint-enable */
import { getLogger } from '../../logger.mjs'
import { ajv } from '../ajv.mjs'
import { requireBody, requireRoom, requireSchema } from '../validators.mjs'
import { roomService } from '../rooms/room.service.mjs'

/**
* @param {nlon.Server} server
*/
export default function handleJoin (server) {
  ajv.addSchema({
    type: 'object',
    properties: {
      roomId: { type: 'string' },
      profile: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          additionalProperties: true
        }
      }
    }
  }, 'schema/room/join')

  server.handle('room/join', async (peer, corr) => {
    const request = await corr.next(
      requireBody(),
      requireSchema('schema/room/join'),
      requireRoom(body => body.roomId)
    )

    /** @type {Room} */
    const room = corr.context.room
    /** @type {User} */
    const profile = request.profile

    const logger = getLogger({
      name: 'joinHandler',
      room: room.id,
      correspondence: corr.header.correspondenceId
    })

    logger.info('Join request')

    // First joiner is admin
    if (roomService.findRoomAdmins(room).length === 0) {
      logger.info('Room has no admin, promoting user to admin')
      profile.isAdmin = true
    }

    // Add user to room
    logger.info(
      { profile: User.sanitize(profile) },
      'Adding user to room'
    )
    const user = roomService.joinRoom(room, profile)
    user.peer = peer

    logger.info('Join successful')
    corr.finish()

    // Add event handlers
    peer.on('disconnect', () => {
      logger.info({ user: user.id }, 'User disconnected, removing from room')
      roomService.leaveRoom(room, user)
    })

    // TODO: Regular pings
  })
}
