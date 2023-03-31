import { onMessage } from '../../wsrouter.mjs'
import { Types, promoteNotification } from '../../domain/messages.mjs'
import User from '../../domain/user.mjs'

function promoteRequestHandler () {
  onMessage((ws, message) => {
    if (message.type !== Types.PromoteRequest) {
      return
    }

    const room = ws.room
    const user = ws.user
    const promoteId = message.data.id
    const promotee = room.findUser(promoteId)

    console.log('User requesting to kick another', { promoter: User.sanitize(user), promoteId, promotee: User.sanitize(promotee) })

    if (!promotee) {
      console.log('Promotee is not present in room', { promoteId: promoteId })
      return
    }

    if (!user.isAdmin) {
      console.log('User is not admin, rejecting', { user: User.sanitize(user) })
      return
    }

    if (promotee === user) {
      console.log('User is trying to promote self, rejecting', { user: User.sanitize(user) })
      return
    }

    // Promote the promotee
    promotee.isAdmin = true

    // Broadcast promotion
    room.users
      .forEach(u => u.websocket.send(promoteNotification(promotee)))
  })
}

export default promoteRequestHandler
