import context from '../context.mjs'
import { getHandState } from '../actions.mjs'

/**
 * Handle a State Change message.
 * @param {any} param0 Event data
 * @param {string} param0.id User id
 * @param {string} param0.state New state
 */
export function stateChangeHandler ({ id, isReady, emote }) {
  const user = context.findParticipant(id)

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
