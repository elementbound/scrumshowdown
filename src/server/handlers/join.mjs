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

    // Prepare request user data
    requestUser.websocket = ws

    // First joiner is admin
    if (roomService.findRoomAdmins(room).length === 0) {
      logger.info('Room has no admin, promoting user to admin')
      requestUser.isAdmin = true
    }

    // Add user to room
    logger.info(
      { userData: User.sanitize(requestUser) },
      'Adding user to room'
    )
    const user = roomService.joinRoom(room, requestUser)

    ws.room = room
    ws.user = user

    logger.info('Confirming join')
    ws.send(confirmJoin(user))
  })
}

export default joinHandler
