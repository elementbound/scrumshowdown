import { onConnect, onClose } from '../../wsrouter.mjs'
import { deleteRoom } from '../services/rooms.mjs'
import { removeParticipant } from '../../domain/messages.mjs'
import { rootLogger } from '../../logger.mjs'

// TODO: Config
const PING_INTERVAL = 3000

function leaveHandler () {
  onConnect(ws => {
    ws.isAlive = true
    const logger = rootLogger().child({ name: 'leaveHandler', event: 'interval' })

    const interval = setInterval(function ping () {
      if (ws.isAlive === false) {
        logger.info(
          { user: ws?.user?.id },
          `User inactive after ${PING_INTERVAL}ms, terminating`
        )
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
    const logger = rootLogger().child({
      name: 'leaveHandler',
      event: 'close',
      room: room?.id,
      user: user?.id
    })

    if (!user) {
      logger.warn('Closed connection with no user associated')
      return
    }

    logger.info(
      { name: user.name },
      'User left room'
    )

    room.users
      .filter(u => u !== user)
      .forEach(u => u.websocket.send(removeParticipant(user)))

    room.removeUser(user.id)

    if (!room.users.length) {
      logger.info('Removing empty room')
      deleteRoom(room.id)
    }
  })
}

export default leaveHandler
