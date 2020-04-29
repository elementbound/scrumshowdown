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
import UserItem from './components/user.item'

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
}

async function main () {
  // Init custom components
  UserItem.define()

  // Start renderer
  await render.startLoop()

  // Register message handlers
  messageHandlers.register(messages.Types.ConfirmJoin, confirmJoinHandler)
  messageHandlers.register(messages.Types.AddParticipant, addParticipantHandler)
  messageHandlers.register(messages.Types.RemoveParticipant, removeParticipantHandler)

  messageHandlers.register(messages.Types.EstimateRequest, estimateRequestHandler)
  messageHandlers.register(messages.Types.EstimateResult, estimateResultHandler)

  messageHandlers.register(messages.Types.StateChange, stateChangeHandler)
  messageHandlers.register(messages.Types.UpdateTopic, updateTopicHandler)

  const oldResize = window.onresize
  window.onresize = () => {
    oldResize && oldResize()
    updateHands()
  }

  const { room, user } = context
  user.name = document.querySelector('.data.user-name').innerHTML
  room.id = document.querySelector('.data.room-id').innerHTML

  console.log('Connecting to WS...')
  const protocol = location.protocol.startsWith('https') ? 'wss' : 'ws'
  const webSocket = new WebSocket(`${protocol}://${window.location.host}/rooms/${room.id}`)
  webSocket.onopen = () => {
    console.log('Socket open!')

    context.user.websocket = webSocket

    const rawSend = webSocket.send
    webSocket.send = data => rawSend.apply(webSocket, [JSON.stringify(data)])
    webSocket.send(messages.join(user.name, room.id))
  }

  webSocket.onmessage = event => {
    const message = JSON.parse(event.data)
    console.log('Received message', message)

    messageHandlers.invoke(message.type, message.data)
  }

  bindUI()
}

main()
