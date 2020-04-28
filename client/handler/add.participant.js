import context from '../context'
import { createHand, getHandState, updateHands } from '../actions'

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

  updateHands()
}
