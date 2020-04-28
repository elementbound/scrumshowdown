const roomService = require('../services/rooms')
const wsRouter = require('../services/wsrouter')
const messages = require('../data/messages')

function joinHandler () {
  wsRouter.onMessage((ws, message) => {
    if (message.type !== messages.Types.Join) {
      return
    }

    const { roomId, username } = message.data

    const room = roomService.getRoom(roomId)
    if (!room) {
      console.error('Joining non-existing room', roomId)
      return
    }

    const user = roomService.joinRoom(room, username)
    user.websocket = ws

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
