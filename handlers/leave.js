const roomService = require('../services/rooms')
const wsRouter = require('../services/wsrouter')
const messages = require('../services/participant.messages')

const PING_INTERVAL = 3000

function leaveHandler () {
  wsRouter.onConnect(ws => {
    ws.isAlive = true

    const interval = setInterval(function ping () {
      if (ws.isAlive === false) {
        console.log(`User inactive after ${PING_INTERVAL}ms, terminating`)
        clearInterval(interval)
        return ws.terminate()
      }

      ws.isAlive = false
      ws.ping(() => { ws.isAlive = true })
    }, PING_INTERVAL)
  })

  wsRouter.onClose(ws => {
    const room = roomService.listRooms()
      .find(room => room.users
        .some(user => user.websocket === ws)
      )

    const user = room.users
      .find(user => user.websocket === ws)

    console.log('User left room', room, { id: user.id, name: user.name })

    room.users
      .filter(u => u !== user)
      .forEach(u => u.websocket.send(messages.removeParticipant(user)))

    room.removeUser(user.id)
  })
}

module.exports = leaveHandler
