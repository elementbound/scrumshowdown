import context from '../context'
import * as render from '../render'
import { updateHands } from '../actions'

/**
 * Handle a Remove Participant message.
 * @param {any} param0 Event data
 * @param {string} param0.id User id
 */
export function kickNotificationHandler () {
  document.querySelector('#kick-splash').classList.remove('hidden')
}
