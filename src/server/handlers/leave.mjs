import { onConnect, onClose } from '../../wsrouter.mjs'
import { deleteRoom } from '../services/rooms.mjs'
import { removeParticipant } from '../../domain/messages.mjs'

const PING_INTERVAL = 3000

function leaveHandler () {
  onConnect(ws => {
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

  onClose(ws => {
    const room = ws.room
    const user = ws.user

    if (!user) {
      console.warn('Closed connection with no user associated')
      return
    }

    console.log('User left room', room, { id: user.id, name: user.name })

    room.users
      .filter(u => u !== user)
      .forEach(u => u.websocket.send(removeParticipant(user)))

    room.removeUser(user.id)

    if (!room.users.length) {
      console.log('Removing empty room', room.id)
      deleteRoom(room.id)
    }
  })
}

export default leaveHandler
