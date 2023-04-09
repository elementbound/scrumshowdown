import { onMessage } from '../../wsrouter.mjs'
import { Types, promoteNotification } from '../../domain/messages.mjs'
import { getLogger } from '../../logger.mjs'

function promoteRequestHandler () {
  onMessage((ws, message) => {
    if (message.type !== Types.PromoteRequest) {
      return
    }

    const room = ws.room
    const user = ws.user
    const promoteId = message.data.id
    const promotee = room.findUser(promoteId)

    const logger = getLogger({
      name: 'promoteRequestHandler',
      room: room?.id,
      user: user?.id,
      target: promoteId
    })

    logger.info('User requesting to kick another')

    if (!promotee) {
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
    room.users
      .forEach(u => u.websocket.send(promoteNotification(promotee)))
  })
}

export default promoteRequestHandler
