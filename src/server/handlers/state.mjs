import { onMessage } from '../../wsrouter.mjs'
import { Types, stateChange } from '../../domain/messages.mjs'
import User from '../../domain/user.mjs'
import { rootLogger } from '../../logger.mjs'

function stateHandler () {
  onMessage((ws, message) => {
    if (message.type !== Types.StateChangeRequest) {
      return
    }

    const room = ws.room
    const user = ws.user
    const { isReady, emote } = message.data
    const logger = rootLogger().child({
      name: 'stateHandler',
      room: room?.id,
      user: user?.id,
      isReady, emote
    })

    logger.info('User requesting to change state')
    user.isReady = isReady
    user.emote = emote

    logger.info('Sending state change notification')
    room.users
      .forEach(u => u.websocket.send(stateChange(user, isReady, emote)))
  })
}

export default stateHandler
