import { onMessage } from '../../wsrouter.mjs'
import { Types, spectatorChange } from '../../domain/messages.mjs'
import User from '../../domain/user.mjs'
import { rootLogger } from '../../logger.mjs'

function spectatorRequestHandler () {
  onMessage((ws, message) => {
    if (message.type !== Types.SpectatorRequest) {
      return
    }

    const room = ws.room
    const user = ws.user
    const spectatorId = message.data.id
    const spectator = room.findUser(spectatorId)

    const logger = rootLogger().child({
      name: 'spectatorRequestHandler',
      room: room?.id,
      user: user?.id,
      target: spectatorId
    })

    logger.info('Spectator change request')

    if (!spectator) {
      logger.error('Trying to make non-existant user spectator')
      return
    }

    if (!user.isAdmin && user !== spectator) {
      logger.warn('User is not admin, and not applying to self')
      return
    }

    // Update the target
    logger.info('Updating target\'s spectator flag')
    spectator.isSpectator = message.data.isSpectator

    // Broadcast change
    logger.info('Sending spectator notification')
    room.users
      .forEach(u => u.websocket.send(spectatorChange(spectator, spectator.isSpectator)))
  })
}

export default spectatorRequestHandler
