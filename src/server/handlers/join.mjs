import { onMessage } from '../../wsrouter.mjs'
import { Types, kickNotification, confirmJoin, addParticipant, updateTopic, estimateResult } from '../../domain/messages.mjs'
import { getLogger } from '../../logger.mjs'
import User from '../../domain/user.mjs'
import { roomRepository } from '../rooms/room.repository.mjs'
import { roomService } from '../rooms/room.service.mjs'

function joinHandler () {
  onMessage((ws, message) => {
    if (message.type !== Types.Join) {
      return
    }

    const { roomId, user: requestUser } = message.data
    const logger = getLogger({
      name: 'joinHandler',
      room: roomId,
      user: requestUser?.id
    })

    logger.info('Join request')

    if (!requestUser.name) {
      logger.error('Joining without username, declining')

      ws.send(kickNotification('Missing profile'))

      ws.close()
      return
    }

    const room = roomRepository.find(roomId)
    if (!room) {
      logger.error('Joining non-existing room', roomId)
      return
    }

    logger.info(
      { userData: User.sanitize(requestUser) },
      'Adding user to room'
    )
    const user = roomService.joinRoom(room, requestUser)
    user.websocket = ws

    // First joiner is admin
    // TODO: Refactor to participation repository
    if (room.findAdmins().length === 0) {
      logger.info('Room has no admin, promoting user to admin')
      user.isAdmin = true
    }

    ws.room = room
    ws.user = user

    logger.info('Confirming join')
    ws.send(confirmJoin(user))

    logger.info('Synchronizing participants')
    room.users
      .filter(u => u !== user)
      .forEach(u => {
        // Let the joinee know about the others
        ws.send(addParticipant(u))

        // Let the others know about the joinee
        u.websocket.send(addParticipant(user))
      })

    // Let the joinee know the current topic
    logger.info('Synchronizing topic')
    ws.send(updateTopic(room.topic))

    // Stream past estimations to the joinee
    logger.info('Synchronizing estimation history')
    room.estimations.forEach(estimation => ws.send(estimateResult(estimation)))
  })
}

export default joinHandler
