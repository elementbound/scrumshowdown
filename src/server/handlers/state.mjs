import { onMessage } from '../../wsrouter.mjs'
import { Types, stateChange } from '../../domain/messages.mjs'
import User from '../../domain/user.mjs'

function stateHandler () {
  onMessage((ws, message) => {
    if (message.type !== Types.StateChangeRequest) {
      return
    }

    const room = ws.room
    const user = ws.user
    const { isReady, emote } = message.data

    console.log('User requesting to change state', { user: User.sanitize(user), isReady, emote })

    user.isReady = isReady
    user.emote = emote

    room.users
      .forEach(u => u.websocket.send(stateChange(user, isReady, emote)))
  })
}

export default stateHandler
