import * as events from './events.mjs'
import * as render from './render.mjs'
import * as messages from '../domain/messages.mjs'
import { MessageSource } from './message.handlers.mjs'
import context from './context.mjs'
import { updateHands } from './actions.mjs'
import confirmJoinHandler from './handler/confirm.join.mjs'
import { addParticipantHandler } from './handler/add.participant.mjs'
import { removeParticipantHandler } from './handler/remove.participant.mjs'
import { estimateRequestHandler } from './handler/estimate.request.mjs'
import { estimateResultHandler } from './handler/estimate.result.mjs'
import { stateChangeHandler } from './handler/state.change.mjs'
import { updateTopicHandler } from './handler/update.topic.mjs'
import UserAdminItem from './components/user.admin.item.mjs'
import UserAdmin from './components/user.admin.mjs'
import { kickNotificationHandler } from './handler/kick.notification.mjs'
import { promoteNotificationHandler } from './handler/promote.notification.mjs'
import { loadUserData } from './storage/user.data.mjs'
import NiceProgress from './components/nice.progress.mjs'
import { spectatorChangeHandler } from './handler/spectator.change.mjs'
import { rootLogger } from '../logger.mjs'

const logger = rootLogger()

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

  events.Source.on(events.Types.AdminKick, user =>
    context.user.websocket.send(messages.kickRequest(user))
  )

  events.Source.on(events.Types.AdminPromote, user =>
    context.user.websocket.send(messages.promoteRequest(user))
  )

  events.Source.on(events.Types.AdminSpectatorToggle, user => {
    const isSpectator = !user.isSpectator
    context.user.websocket.send(messages.spectatorRequest(user, isSpectator))
  })
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
    logger.error('Failed to initialize renderer', e)

    const errorSplash = document.querySelector('#error-splash')
    const errorDescription = document.querySelector('#error-description')
    const errorException = document.querySelector('#error-exception')

    errorSplash.classList.remove('hidden')
    errorDescription.textContent = 'Failed to initialize renderer. Unfortunately, WebGL support is required.'
    errorException.textContent = e.toString()

    return false
  }

  // Subjects:
  // room/update/spectator
  // room/update/topic
  // room/update/state
  // room/update/promote
  // room/update/estimation

  // Register message handlers
  MessageSource.on(messages.Types.ConfirmJoin, confirmJoinHandler)
  MessageSource.on(messages.Types.AddParticipant, addParticipantHandler)
  MessageSource.on(messages.Types.RemoveParticipant, removeParticipantHandler)

  MessageSource.on(messages.Types.EstimateRequest, estimateRequestHandler)
  MessageSource.on(messages.Types.EstimateResult, estimateResultHandler)

  MessageSource.on(messages.Types.StateChange, stateChangeHandler)
  MessageSource.on(messages.Types.UpdateTopic, updateTopicHandler)

  MessageSource.on(messages.Types.KickNotification, kickNotificationHandler)
  MessageSource.on(messages.Types.PromoteNotification, promoteNotificationHandler)
  MessageSource.on(messages.Types.SpectatorChange, spectatorChangeHandler)

  const oldResize = window.onresize
  window.onresize = () => {
    oldResize && oldResize()
    updateHands()
  }
  updateHands()

  const { room, user } = context
  room.id = document.querySelector('.data.room-id').innerHTML

  const userData = loadUserData()
  user.name = userData.name
  user.color = userData.color

  logger.info('Connecting to WS...')
  const protocol = location.protocol.startsWith('https') ? 'wss' : 'ws'
  const webSocket = new WebSocket(`${protocol}://${window.location.host}/rooms/${room.id}`)
  webSocket.onopen = () => {
    logger.info('Socket open!')

    user.websocket = webSocket

    logger.info('Joining with user', user)

    const rawSend = webSocket.send
    webSocket.send = data => rawSend.apply(webSocket, [JSON.stringify(data)])
    webSocket.send(messages.join(user, room.id))
  }

  webSocket.onmessage = event => {
    const message = JSON.parse(event.data)
    logger.info('Received message', message)

    MessageSource.emit(message.type, message.data)
  }

  bindUI()
}

main()
