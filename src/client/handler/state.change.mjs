import assert from 'node:assert'
import context from '../context.mjs'
import { getHandState } from '../actions.mjs'

/**
 * Handle a State Change message.
 * @param {object} state State
 */
export function stateChangeHandler (state) {
  const { target, isReady, emote } = state
  const user = context.findParticipant(target)
  assert(user, `Trying to update unknown user: ${target}`)

  user.isReady = isReady
  user.emote = emote
  user.hand.state = getHandState(user)

  if (user === context.user) {
    const readyToggle = document.querySelector('.action.toggle-ready')
    const labelOff = readyToggle.getAttribute('data-toggle-off')
    const labelOn = readyToggle.getAttribute('data-toggle-on')

    readyToggle.innerHTML = user.isReady ? labelOn : labelOff
  }
}
