import context from '../context.mjs'
import * as render from '../render.mjs'
import { updateHands } from '../actions.mjs'

/**
 * Handle a Remove Participant message.
 * @param {any} param0 Event data
 * @param {string} param0.id User id
 */
export function removeParticipantHandler ({ id }) {
  const user = context.findParticipant(id)
  context.participants.delete(user)

  const hand = user.hand
  render.context.objects = render.context.objects.filter(object => object !== hand)
  hand.dispose()

  document.querySelector('#users').remove(user)

  updateHands()
}
