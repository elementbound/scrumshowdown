import { onMessage } from '../../wsrouter.mjs'
import { Types, spectatorChange } from '../../domain/messages.mjs'
import User from '../../domain/user.mjs'

function spectatorRequestHandler () {
  onMessage((ws, message) => {
    if (message.type !== Types.SpectatorRequest) {
      return
    }

    const room = ws.room
    const user = ws.user
    const spectatorId = message.data.id
    const spectator = room.findUser(spectatorId)

    console.log('Spectator change request')

    if (!spectator) {
      console.warn('Trying to make non-existant user spectator', { spectatorId })
      return
    }

    if (!user.isAdmin && user !== spectator) {
      console.warn('User is not admin, and not applying to self', { user: User.sanitize(user), spectatorId })
      return
    }

    // Update the target
    spectator.isSpectator = message.data.isSpectator

    // Broadcast change
    room.users
      .forEach(u => u.websocket.send(spectatorChange(spectator, spectator.isSpectator)))
  })
}

export default spectatorRequestHandler
