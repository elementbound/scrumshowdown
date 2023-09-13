import context from '../context.mjs'
import * as messages from '../../domain/messages.mjs'
import { createHand, sendStateChange, sendEmote, updateTopic } from '../actions.mjs'
import { getLogger } from '../../logger.mjs'

const logger = getLogger('confirmJoinHandler')

/**
 * Handle a Confirm Join message.
 * @param {User} user User data
 */
export default function confirmJoinHandler (user) {
  logger.info({ user }, 'Join confirmed with user data')
  context.user = Object.assign({}, context.user, user)
  context.participants.add(context.user)

  const hand = createHand(user)
  context.user.hand = hand

  document.querySelector('#users').add(user)

  document.querySelector('.action.toggle-ready').onclick = () => {
    const { user } = context

    user.isReady = !user.isReady
    sendStateChange(user)
  }

  document.querySelector('.action.thumbsup').onclick = sendEmote('thumbsUp')
  document.querySelector('.action.thumbsdown').onclick = sendEmote('thumbsDown')

  document.querySelector('.action.request-estimate').onclick = () => {
    const { user } = context

    logger.info('Requesting estimates')
    user.websocket.send(messages.estimateRequest())
  }

  document.querySelector('.action.toggle-logs').onclick = () => {
    const logs = document.querySelector('#logs')

    if (logs.classList.contains('hidden')) {
      logs.classList.remove('hidden')
    } else {
      logs.classList.add('hidden')
    }
  }

  const topic = document.querySelector('#topic')
  topic.isBeingEdited = false

  topic.onfocus = () => { topic.isBeingEdited = true }
  topic.onblur = () => {
    topic.isBeingEdited = false
    updateTopic()
  }

  topic.onkeypress = event => {
    if (event.keyCode === 13) {
      context.user.websocket.send(messages.updateTopic(topic.innerText))

      topic.blur()
    }
  }

  const roomIdBox = document.querySelector('#roomIdBox')
  roomIdBox.onfocus = async () => {
    const text = `Room: ${context.room.id}`
    roomIdBox.innerText = text

    await navigator.clipboard.writeText(context.room.id)

    roomIdBox.innerText = 'Copied to clipboard!'
    setTimeout(() => { roomIdBox.innerText = text }, 1000)
  }
}
