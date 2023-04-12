import { onMessage } from '../../wsrouter.mjs'
import { Types, kickNotification, removeParticipant } from '../../domain/messages.mjs'
import { getLogger } from '../../logger.mjs'
import { userRepository } from '../users/user.repository.mjs'
import { roomService } from '../rooms/room.service.mjs'

function kickRequestHandler () {
  onMessage((ws, message) => {
    if (message.type !== Types.KickRequest) {
      return
    }

    const room = ws.room
    const user = ws.user
    const kickId = message.data.id
    const kickee = userRepository.find(kickId)

    const logger = getLogger({
      room: room?.id,
      user: user?.id,
      target: kickId
    })

    logger.info('User requesting to kick another')

    if (!kickee) {
      logger.error('Unknown kick target!')
      return
    }

    if (!user.isAdmin) {
      logger.warn('User is not admin, rejecting')
      return
    }

    if (kickee === user) {
      logger.error('User is trying to kick self, rejecting')
      return
    }

    // Remove user
    if (!roomService.leaveRoom(room, kickee)) {
      logger.warn('User was trying to kick someone from another room, rejecting')
      return
    }
  })
}

export default kickRequestHandler
