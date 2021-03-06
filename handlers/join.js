const roomService = require('../services/rooms')
const wsRouter = require('../services/wsrouter')
const messages = require('../data/messages')

function joinHandler () {
  wsRouter.onMessage((ws, message) => {
    if (message.type !== messages.Types.Join) {
      return
    }

    const { roomId, user: requestUser } = message.data
    console.log('Join request', { roomId, requestUser })

    if (!requestUser.name) {
      console.error('Joining without username, declining')

      ws.send(messages.kickNotification('Missing profile'))

      ws.close()
      return
    }

    const room = roomService.getRoom(roomId)
    if (!room) {
      console.error('Joining non-existing room', roomId)
      return
    }

    const user = roomService.joinRoom(room, requestUser)
    user.websocket = ws

    // First joiner is admin
    user.isAdmin = (room.findAdmins().length === 0)

    ws.room = room
    ws.user = user

    ws.send(messages.confirmJoin(user))
    room.users
      .filter(u => u !== user)
      .forEach(u => {
        // Let the joinee know about the others
        ws.send(messages.addParticipant(u))

        // Let the others know about the joinee
        u.websocket.send(messages.addParticipant(user))
      })

    // Let the joinee know the current topic
    ws.send(messages.updateTopic(room.topic))

    // Stream past estimations to the joinee
    room.estimations.forEach(estimation => ws.send(messages.estimateResult(estimation)))

    console.log(room)
  })
}

module.exports = joinHandler
