import context from '../context.mjs'
import { createHand, getHandState, updateHands } from '../actions.mjs'

/**
 * Handle an Add Participant message.
 * @param {any} param0 Event data
 * @param {User} param0.user Confirmed User data
 */
export function addParticipantHandler ({ user }) {
  context.room.users.push(user)

  console.log(`Adding user ${user.id}`)

  const hand = createHand(user)
  hand.state = getHandState(user)
  user.hand = hand

  document.querySelector('#users').add(user)

  updateHands()
}
