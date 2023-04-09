import { getRoom, joinRoom } from '../services/rooms.mjs'
import { onMessage } from '../../wsrouter.mjs'
import { Types, kickNotification, confirmJoin, addParticipant, updateTopic, estimateResult } from '../../domain/messages.mjs'
import { rootLogger } from '../../logger.mjs'
import User from '../../domain/user.mjs'

function joinHandler () {
  onMessage((ws, message) => {
    if (message.type !== Types.Join) {
      return
    }

    const { roomId, user: requestUser } = message.data
    const logger = rootLogger().child({
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

    const room = getRoom(roomId)
    if (!room) {
      logger.error('Joining non-existing room', roomId)
      return
    }

    logger.info(
      { userData: User.sanitize(requestUser) },
      'Adding user to room'
    )
    const user = joinRoom(room, requestUser)
    user.websocket = ws

    // First joiner is admin
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
