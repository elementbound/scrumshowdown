const wsRouter = require('../services/wsrouter')
const messages = require('../data/messages')
const User = require('../data/user')

function kickRequestHandler () {
  wsRouter.onMessage((ws, message) => {
    if (message.type !== messages.Types.KickRequest) {
      return
    }

    const room = ws.room
    const user = ws.user
    const kickId = message.data.id
    const kickee = room.findUser(kickId)

    console.log('User requesting to kick another', { kicker: User.sanitize(user), kickId, kickee: User.sanitize(kickee) })

    if (!kickee) {
      console.log('Kickee is not present in room', { kickId })
      return
    }

    if (!user.isAdmin) {
      console.log('User is not admin, rejecting', { user: User.sanitize(user) })
      return
    }

    if (kickee === user) {
      console.log('User is trying to kick self, rejecting', { user: User.sanitize(user) })
      return
    }

    // Let the kickee know they are getting kicked
    kickee.websocket.send(messages.kickNotification())
    kickee.websocket.close()

    // Remove user
    room.removeUser(kickId)

    // Let the others know the user was kicked
    room.users
      .forEach(u => u.websocket.send(messages.removeParticipant(kickee)))
  })
}

module.exports = kickRequestHandler
