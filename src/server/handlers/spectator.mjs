import { onMessage } from '../../wsrouter.mjs'
import { Types, spectatorChange } from '../../domain/messages.mjs'
import { getLogger } from '../../logger.mjs'
import { userRepository } from '../users/user.repository.mjs'
import { participationRepository } from '../rooms/participation.repository.mjs'
import { roomService } from '../rooms/room.service.mjs'

function spectatorRequestHandler () {
  onMessage((ws, message) => {
    if (message.type !== Types.SpectatorRequest) {
      return
    }

    const room = ws.room
    const user = ws.user
    const spectatorId = message.data.id
    const spectator = userRepository.find(spectatorId)

    const logger = getLogger({
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

    if (!participationRepository.isUserInRoom(user.id, room.id)) {
      logger.error('Trying to make someone spectator in another room!')
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
    roomService.broadcast(room, spectatorChange(spectator, spectator.isSpectator))
  })
}

export default spectatorRequestHandler
