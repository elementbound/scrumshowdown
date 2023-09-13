import context from '../context.mjs'
import * as render from '../render.mjs'
import { updateHands } from '../actions.mjs'
import { getLogger } from '../../logger.mjs'
import User from '../../domain/user.mjs'

const logger = getLogger({ name: 'removeParticipantHandler' })

/**
 * Handle a Remove Participant message.
 * @param {User} user User
 */
export function removeParticipantHandler (user) {
  const id = user.id
  logger.info(
    { user: id, participants: context.participants },
    'Removing user from room'
  )

  user = context.findParticipant(id)
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
