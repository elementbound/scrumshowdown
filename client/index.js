import * as events from './events'
import * as render from './render'
import * as messages from '../data/messages'
import * as messageHandlers from './message.handlers'
import context from './context'
import { updateHands } from './actions'
import confirmJoinHandler from './handler/confirm.join'
import { addParticipantHandler } from './handler/add.participant'
import { removeParticipantHandler } from './handler/remove.participant'
import { estimateRequestHandler } from './handler/estimate.request'
import { estimateResultHandler } from './handler/estimate.result'
import { stateChangeHandler } from './handler/state.change'
import { updateTopicHandler } from './handler/update.topic'
import UserAdminItem from './components/user.admin.item'
import UserAdmin from './components/user.admin'
import { kickNotificationHandler } from './handler/kick.notification'
import { promoteNotificationHandler } from './handler/promote.notification'
import { loadUserData } from './storage/user.data'
import NiceProgress from './components/nice.progress'

function bindUI () {
  document.querySelector('.action.toggle-more').onclick = function () {
    const users = document.querySelector('#users')
    const toggleOn = this.getAttribute('data-toggle-on')
    const toggleOff = this.getAttribute('data-toggle-off')

    if (users.classList.contains('hidden')) {
      users.classList.remove('hidden')
      this.innerHTML = toggleOn
    } else {
      users.classList.add('hidden')
      this.innerHTML = toggleOff
    }
  }

  events.subscribe(events.Types.AdminKick, user =>
    context.user.websocket.send(messages.kickRequest(user))
  )

  events.subscribe(events.Types.AdminPromote, user =>
    context.user.websocket.send(messages.promoteRequest(user))
  )
}

async function main () {
  // Init custom components
  UserAdminItem.define()
  UserAdmin.define()
  NiceProgress.define()

  // Start renderer
  try {
    await render.startLoop()
  } catch (e) {
    console.error('Failed to initialize renderer', e)

    const errorSplash = document.querySelector('#error-splash')
    const errorDescription = document.querySelector('#error-description')
    const errorException = document.querySelector('#error-exception')

    errorSplash.classList.remove('hidden')
    errorDescription.textContent = 'Failed to initialize renderer. Unfortunately, WebGL support is required.'
    errorException.textContent = e.toString()

    return false
  }

  // Register message handlers
  messageHandlers.register(messages.Types.ConfirmJoin, confirmJoinHandler)
  messageHandlers.register(messages.Types.AddParticipant, addParticipantHandler)
  messageHandlers.register(messages.Types.RemoveParticipant, removeParticipantHandler)

  messageHandlers.register(messages.Types.EstimateRequest, estimateRequestHandler)
  messageHandlers.register(messages.Types.EstimateResult, estimateResultHandler)

  messageHandlers.register(messages.Types.StateChange, stateChangeHandler)
  messageHandlers.register(messages.Types.UpdateTopic, updateTopicHandler)

  messageHandlers.register(messages.Types.KickNotification, kickNotificationHandler)
  messageHandlers.register(messages.Types.PromoteNotification, promoteNotificationHandler)

  const oldResize = window.onresize
  window.onresize = () => {
    oldResize && oldResize()
    updateHands()
  }

  const { room, user } = context
  room.id = document.querySelector('.data.room-id').innerHTML

  const userData = loadUserData()
  user.name = userData.name
  user.color = userData.color

  console.log('Connecting to WS...')
  const protocol = location.protocol.startsWith('https') ? 'wss' : 'ws'
  const webSocket = new WebSocket(`${protocol}://${window.location.host}/rooms/${room.id}`)
  webSocket.onopen = () => {
    console.log('Socket open!')

    user.websocket = webSocket

    console.log('Joining with user', user)

    const rawSend = webSocket.send
    webSocket.send = data => rawSend.apply(webSocket, [JSON.stringify(data)])
    webSocket.send(messages.join(user, room.id))
  }

  webSocket.onmessage = event => {
    const message = JSON.parse(event.data)
    console.log('Received message', message)

    messageHandlers.invoke(message.type, message.data)
  }

  bindUI()
}

main()
