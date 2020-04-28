import Mustache from 'mustache'
import User from '../data/user'
import Hand from './objects/hand'
import * as render from './render'
import { DEG2RAD } from './utils'
import * as messages from '../data/messages'
import context from './context'

const EMOTE_DURATION = 1000

const RESULTS_TEMPLATE = `
  <h2>{{topic}}</h2>

  {{#summary}}
    <div class="row summary">
      {{estimate}} <progress value="{{percentage}}">{{count}}</progress>
    </div>
  {{/summary}}

  {{#votes}}
    <div class="row vote">
      <div>{{user.name}}</div>
      <div>{{estimate}}</div>
    </div>
  {{/votes}}
`

const messageHandlers = {
  [messages.Types.ConfirmJoin]: confirmJoinHandler,
  [messages.Types.AddParticipant]: addParticipantHandler,
  [messages.Types.RemoveParticipant]: removeParticipantHandler,
  [messages.Types.StateChange]: stateChangeHandler,
  [messages.Types.EstimateRequest]: estimateRequestHandler,
  [messages.Types.EstimateResult]: estimateResultHandler,
  [messages.Types.UpdateTopic]: updateTopicHandler
}

function createHand (user) {
  const { camera, scene } = render.context
  const model = render.context.models.hand
  const hand = new Hand({
    name: user.name,
    camera,
    model,
    scene
  })
  render.context.objects.push(hand)

  return hand
}

/**
 * Determine which hand state to display for user.
 * @param {User} user User
 */
function getHandState (user) {
  return user.emote
    ? user.emote
    : (user.isReady ? 'ready' : 'idle')
}

/**
 * Send state change to host.
 * @param {User} user User
 */
function sendStateChange (user) {
  user.websocket.send(messages.stateChangeRequest(user.isReady, user.emote))
}

/**
 * Align hands around the screen.
 *
 * @param {Hand[]} hands Hand objects
 */
function alignHands (hands) {
  const handCount = hands.length

  console.log(`Realigning with ${handCount} hands`)

  const scale = Hand.calculateScale(handCount, render.context.camera)
  hands.forEach((hand, i) => hand.align(i, handCount, scale))

  return scale
}

/**
 * Update all hands.
 */
export function updateHands () {
  const hands = context.room.users.map(user => user.hand)
  const handDistance = alignHands(hands)

  const { camera } = render.context
  camera.position.z = (2 * handDistance) / (2 * Math.tan(camera.fov / 2 * DEG2RAD))
}

async function main () {
  await render.startLoop()

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

    const handler = messageHandlers[message.type]
    handler && handler(message.data)
  }
}

function sendEmote (emote) {
  return function () {
    console.log('Sending emote', emote)

    const { user } = context
    const { websocket } = user

    user.emote = emote
    websocket.send(messages.stateChangeRequest(user.isReady, user.emote))

    context.emoteTimeout && clearTimeout(context.emoteTimeout)
    context.emoteTimeout = setTimeout(() => {
      user.emote = ''
      sendStateChange(user)
    }, EMOTE_DURATION)
  }
}

/**
 * Handle a Confirm Join message.
 * @param {any} param0 Event data
 * @param {User} param0.user Confirmed User data
 */
function confirmJoinHandler ({ user }) {
  console.log('Join confirmed with user data', user)
  context.user = Object.assign({}, context.user, user)
  context.room.users.push(context.user)

  const hand = createHand(user)
  context.user.hand = hand

  console.log(document.querySelector('.action.idle'))
  document.querySelector('.action.toggle-ready').onclick = () => {
    const { user } = context

    user.isReady = !user.isReady
    sendStateChange(user)
  }

  document.querySelector('.action.thumbsup').onclick = sendEmote('thumbsUp')
  document.querySelector('.action.thumbsdown').onclick = sendEmote('thumbsDown')

  document.querySelector('.action.request-estimate').onclick = () => {
    const { user } = context

    console.log('Requesting estimates')
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
      console.log(topic.innerText)
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

/**
 * Handle an Add Participant message.
 * @param {any} param0 Event data
 * @param {User} param0.user Confirmed User data
 */
function addParticipantHandler ({ user }) {
  context.room.users.push(user)

  console.log(`Adding user ${user.id}`)

  const hand = createHand(user)
  hand.state = getHandState(user)
  user.hand = hand

  updateHands()
}

/**
 * Handle a Remove Participant message.
 * @param {any} param0 Event data
 * @param {string} param0.id User id
 */
function removeParticipantHandler ({ id }) {
  const user = context.room.users.find(u => u.id === id)
  context.room.removeUser(id)

  const hand = user.hand
  render.context.objects = render.context.objects.filter(object => object !== hand)
  hand.dispose()

  updateHands()
}

/**
 * Handle a State Change message.
 * @param {any} param0 Event data
 * @param {string} param0.id User id
 * @param {string} param0.state New state
 */
function stateChangeHandler ({ id, isReady, emote }) {
  const user = context.room.users.find(u => u.id === id)
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

function estimateRequestHandler () {
  const estimate = document.querySelector('[name=estimate]').value

  const { user } = context
  console.log('Responding with estimate', estimate)
  user.websocket.send(messages.estimateResponse(estimate))
}

function estimateResultHandler ({ estimation }) {
  console.log('Received estimation', estimation)
  context.estimations.push(estimation)

  const resultHtml = renderEstimationResults(estimation.topic, estimation.estimates)

  const logItem = document.createElement('div')
  const logs = document.querySelector('#logs')
  logItem.innerHTML = resultHtml
  logs.prepend(logItem)

  logs.classList.remove('hidden')
}

function updateTopicHandler ({ topic }) {
  context.room.topic = topic
  updateTopic()
}

function updateTopic () {
  const topic = context.room.topic
  const topicElement = document.querySelector('#topic')
  if (!topicElement.isBeingEdited) {
    if (topic) {
      topicElement.innerText = topic
    } else {
      topicElement.innerHTML = '<i>Topic</i>'
    }
  }
}

function renderEstimationResults (topic, estimates) {
  const votes = Object.entries(estimates)
    .map(([id, estimate]) => ({
      user: context.room.users.find(u => u.id === id) || new User(id, `{${id}}`),
      estimate
    }))
    .sort((a, b) => {
      const estimateCompare = b.estimate.toString().localeCompare(a.estimate)
      const nameCompare = a.user.name.localeCompare(b.user.name)

      return estimateCompare !== 0
        ? estimateCompare
        : nameCompare
    })

  const summary = Object.entries(votes
    .reduce((collector, { user, estimate }) => Object.assign({}, collector, {
      [estimate]: (collector[estimate] || 0) + 1 / votes.length
    }), {}))
    .map(([estimate, percentage]) => ({ estimate, percentage, count: percentage * votes.length }))
    .sort((a, b) => b.percentage - a.percentage)

  return Mustache.render(RESULTS_TEMPLATE, {
    topic, votes, summary
  })
}

main()
