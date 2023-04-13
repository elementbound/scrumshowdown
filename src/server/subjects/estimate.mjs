/* eslint-disable */
import * as nlon from '@elementbound/nlon'
import Room from '../../domain/room.mjs'
import User from '../../domain/user.mjs'
/* eslint-enable */
import { fail } from 'node:assert'
import { requireAuthorization, requireBody, requireLogin, requireLoginRoom, requireSchema } from '../validators.mjs'
import { roomService } from '../rooms/room.service.mjs'
import { Message, MessageHeader } from '@elementbound/nlon'
import { ajv } from '../ajv.mjs'

/**
* @param {nlon.Server} server
*/
export default function handleEstimate (server) {
  ajv.addSchema({
    type: 'object',
    properties: {
      estimate: { type: 'string' }
    }
  }, 'schema/room/estimate/gather/response')

  server.handle('room/estimate', async (peer, corr) => {
    await corr.next(
      requireAuthorization(),
      requireLogin(),
      requireLoginRoom()
    )

    /** @type {Room} */
    const room = corr.context.room
    /** @type {User} */
    const user = corr.context.user

    const logger = getLogger({
      name: 'estimateHandler',
      room: room?.id,
      user: user.id
    })

    const participants = roomService.findParticipants(room)
    const votingUsers = participants.filter(user => !user.isSpectator)

    // Check if everyone's ready
    if (!votingUsers.every(user => user.isReady)) {
      logger.info('Some users are not ready yet, declining')
      // TODO: Notify everyone of the decline?
      fail('Not all users are ready!')
    }

    // Broadcast request
    logger.info(
      'Broadcasting estimate request, waiting for %d responses',
      votingUsers.length
    )

    const responsePromises = votingUsers.map(async user => {
      const corr = user.peer.send(new Message({
        header: new MessageHeader({
          subject: 'room/estimate/gather'
        })
      })).finish()

      const response = await corr.next(
        requireBody(),
        requireSchema('schema/room/estimate/gather/response')
      )

      return [user.id, response.estimate]
    })

    // Save estimation data
    const votes = Object.fromEntries(
      await Promise.all(responsePromises)
    )

    const estimation = new Estimation(room.topic, votes)
    room.estimations.push(estimation)

    // Broadcast results
    logger.info({ votes }, 'Broadcasting results')
    // TODO

    // Unready everyone after vote
    // TODO
  })
}
