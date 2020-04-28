import context from '../context'
import * as render from '../render'
import { updateHands } from '../actions'

/**
 * Handle a Remove Participant message.
 * @param {any} param0 Event data
 * @param {string} param0.id User id
 */
export function removeParticipantHandler ({ id }) {
  const user = context.room.users.find(u => u.id === id)
  context.room.removeUser(id)

  const hand = user.hand
  render.context.objects = render.context.objects.filter(object => object !== hand)
  hand.dispose()

  updateHands()
}
