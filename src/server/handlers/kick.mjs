import { onMessage } from '../services/wsrouter'
import { Types, kickNotification, removeParticipant } from '../data/messages'
import { sanitize } from '../data/user'

function kickRequestHandler () {
  onMessage((ws, message) => {
    if (message.type !== Types.KickRequest) {
      return
    }

    const room = ws.room
    const user = ws.user
    const kickId = message.data.id
    const kickee = room.findUser(kickId)

    console.log('User requesting to kick another', { kicker: sanitize(user), kickId, kickee: sanitize(kickee) })

    if (!kickee) {
      console.log('Kickee is not present in room', { kickId })
      return
    }

    if (!user.isAdmin) {
      console.log('User is not admin, rejecting', { user: sanitize(user) })
      return
    }

    if (kickee === user) {
      console.log('User is trying to kick self, rejecting', { user: sanitize(user) })
      return
    }

    // Let the kickee know they are getting kicked
    kickee.websocket.send(kickNotification())
    kickee.websocket.close()

    // Remove user
    room.removeUser(kickId)

    // Let the others know the user was kicked
    room.users
      .forEach(u => u.websocket.send(removeParticipant(kickee)))
  })
}

export default kickRequestHandler
