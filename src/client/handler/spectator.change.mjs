import assert from 'node:assert'
import { getLogger } from '../../logger.mjs'
import context from '../context.mjs'

const logger = getLogger({ name: 'spectatorChangeHandler' })

export function spectatorChangeHandler (id, isSpectator) {
  const user = context.findParticipant(id)
  assert(user, `Toggling spectator on unknown user: ${id}`)

  logger.info({ id, user, isSpectator }, 'Spectator change')

  user.isSpectator = isSpectator
  user.hand.isSpectator = isSpectator

  logger.info({ user, context }, 'Spectator change applied');

  [...document.querySelectorAll('user-admin')]
    .flatMap(userAdmin => userAdmin.userEntries)
    .filter(entry => entry.user.id === user.id)
    .forEach(({ user, item }) => {
      user.isSpectator = isSpectator
      item.isSpectator = isSpectator
    })
}
