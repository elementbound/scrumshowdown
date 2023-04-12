import { onMessage } from '../../wsrouter.mjs'
import { Types, promoteNotification } from '../../domain/messages.mjs'
import { getLogger } from '../../logger.mjs'
import { userRepository } from '../users/user.repository.mjs'
import { participationRepository } from '../rooms/participation.repository.mjs'
import { roomService } from '../rooms/room.service.mjs'

function promoteRequestHandler () {
  onMessage((ws, message) => {
    if (message.type !== Types.PromoteRequest) {
      return
    }

    const room = ws.room
    const user = ws.user
    const promoteId = message.data.id
    const promotee = userRepository.find(promoteId)

    const logger = getLogger({
      name: 'promoteRequestHandler',
      room: room?.id,
      user: user?.id,
      target: promoteId
    })

    logger.info('User requesting to promote another')

    if (!promotee || !participationRepository.isUserInRoom(promotee.id, room.id)) {
      logger.error('Promotee is not present in room')
      return
    }

    if (!user.isAdmin) {
      logger.error('User is not admin, rejecting')
      return
    }

    if (promotee === user) {
      logger.warn('User is trying to promote self, rejecting')
      return
    }

    // Promote the promotee
    logger.info('Promoting to admin')
    promotee.isAdmin = true

    // Broadcast promotion
    logger.info('Sending promote notification')
    roomService.broadcast(room, promoteNotification(promotee))
  })
}

export default promoteRequestHandler
