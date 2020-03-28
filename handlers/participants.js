const roomService = require('../services/rooms')
const wsRouter = require('../services/wsrouter')

function participantsHandler () {
  wsRouter.onMessage((ws, message) => {
    if (message.type !== 'Join') {
      return
    }

    const { roomId } = message.data

    const room = roomService.getRoom(roomId)
    if (!room) {
      console.error('Joining non-existing room', roomId)
      return
    }

    wsRouter.server().clients
      .forEach(client =>
        client.send({
          type: 'Update-Participants',
          data: room.users
        })
      )

    console.log(room)
  })
}

module.exports = participantsHandler
