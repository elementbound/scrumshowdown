import { config } from '../config.mjs'
import { onConnect, onClose } from '../../wsrouter.mjs'
import { removeParticipant } from '../../domain/messages.mjs'
import { getLogger } from '../../logger.mjs'
import { roomService } from '../rooms/room.service.mjs'

const PING_INTERVAL_SECONDS = config.ws.ping.interval

function leaveHandler () {
  onConnect(ws => {
    ws.isAlive = true
    const logger = getLogger({ name: 'leaveHandler', event: 'interval' })

    const interval = setInterval(function ping () {
      if (ws.isAlive === false) {
        // TODO: Remove user from userRepository and participationRepository
        logger.info(
          { user: ws?.user?.id },
          `User inactive after ${PING_INTERVAL_SECONDS}ms, terminating`
        )
        clearInterval(interval)
        return ws.terminate()
      }

      ws.isAlive = false
      ws.ping(() => { ws.isAlive = true })
    }, PING_INTERVAL_SECONDS * 1000)
  })

  onClose(ws => {
    const room = ws.room
    const user = ws.user
    const logger = getLogger({
      name: 'leaveHandler',
      event: 'close',
      room: room?.id,
      user: user?.id
    })

    if (!user) {
      logger.warn('Closed connection with no user associated')
      return
    }

    roomService.leaveRoom(room, user)
    logger.info(
      { username: user.name },
      'User left room'
    )
  })
}

export default leaveHandler
