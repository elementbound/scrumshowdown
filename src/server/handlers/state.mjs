import { onMessage } from '../services/wsrouter'
import { Types, stateChange } from '../data/messages'
import { sanitize } from '../data/user'

function stateHandler () {
  onMessage((ws, message) => {
    if (message.type !== Types.StateChangeRequest) {
      return
    }

    const room = ws.room
    const user = ws.user
    const { isReady, emote } = message.data

    console.log('User requesting to change state', { user: sanitize(user), isReady, emote })

    user.isReady = isReady
    user.emote = emote

    room.users
      .forEach(u => u.websocket.send(stateChange(user, isReady, emote)))
  })
}

export default stateHandler
