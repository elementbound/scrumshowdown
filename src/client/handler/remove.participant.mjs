import context from '../context.mjs'
import * as render from '../render.mjs'
import { updateHands } from '../actions.mjs'
import { getLogger } from '../../logger.mjs'

const logger = getLogger({ name: 'removeParticipantHandler' })

/**
 * Handle a Remove Participant message.
 * @param {any} param0 Event data
 * @param {string} param0.id User id
 */
export function removeParticipantHandler ({ id }) {
  logger.info(
    { user: id, participants: context.participants },
    'Removing user from room'
  )

  const user = context.findParticipant(id)
  logger.info(
    { user },
    'Found user to remove'
  )

  context.participants.delete(user)

  const hand = user.hand
  render.context.objects = render.context.objects.filter(object => object !== hand)
  hand.dispose()

  document.querySelector('#users').remove(user)

  updateHands()
}
