import context from '../context.mjs'
import { createHand, getHandState, updateHands } from '../actions.mjs'
import { getLogger } from '../../logger.mjs'

const logger = getLogger({ name: 'addParticipantHandler' })

/**
 * Handle an Add Participant message.
 * @param {User} user User data
 */
export function addParticipantHandler (user) {
  context.participants.add(user)

  logger.info(`Adding user ${user.id}`)

  const hand = createHand(user)
  hand.state = getHandState(user)
  user.hand = hand

  document.querySelector('#users').add(user)

  updateHands()
}
