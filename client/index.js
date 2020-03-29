import Mustache from 'mustache'
import User from '../data/user'
import Room from '../data/room'
import Hand from './objects/hand'
import * as render from './render'
import { DEG2RAD } from './utils'
import * as messages from '../services/participant.messages'

const EMOTE_DURATION = 1000

const RESULTS_TEMPLATE = `
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

const context = {
  room: new Room(undefined),
  user: new User(undefined, undefined),
  topic: '',

  emoteTimeout: undefined
}

const messageHandlers = {
  'Confirm-Join': confirmJoinHandler,
  'Add-Participant': addParticipantHandler,
  'Remove-Participant': removeParticipantHandler,
  'State-Change': stateChangeHandler,
  'Estimate-Request': estimateRequestHandler,
  'Estimate-Result': estimateResultHandler,
  'Update-Topic': updateTopicHandler
}

function createHand (user) {
  const { camera, scene } = render.context
  const models = render.context.models.hand
  const hand = new Hand({
    name: user.name,
    camera,
    models,
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
  const webSocket = new WebSocket(`ws://localhost:3000/rooms/${room.id}`)
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

  const toolsToggle = document.querySelector('.action.toggle-tools')
  toolsToggle.onclick = () => {
    console.log('Toggling tools')
    const tools = [...document.querySelectorAll('.tool')]
    const visible = tools.every(tool => !tool.classList.contains('hidden'))

    const labelOff = toolsToggle.getAttribute('data-toggle-off')
    const labelOn = toolsToggle.getAttribute('data-toggle-on')

    if (visible) {
      console.log('Hiding tools')
      tools
        .filter(tool => !tool.classList.contains('hidden'))
        .forEach(tool => tool.classList.add('hidden'))

      toolsToggle.innerHTML = labelOff
    } else {
      console.log('Showing tools')
      tools
        .filter(tool => tool.classList.contains('hidden'))
        .forEach(tool => tool.classList.remove('hidden'))

      toolsToggle.innerHTML = labelOn
    }
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

function estimateResultHandler ({ estimates }) {
  document.querySelector('.results').innerHTML = renderEstimationResults(estimates)
}

function updateTopicHandler ({ topic }) {
  context.room.topic = topic
  updateTopic()
}

function updateTopic () {
  const topic = context.room.topic
  const topicElement = document.querySelector('#topic')
  if (!topicElement.isBeingEdited) {
    // topicElement.innerText = topic
    if (topic) {
      topicElement.innerText = topic
    } else {
      topicElement.innerHTML = '<i>Topic</i>'
    }
  }
}

function renderEstimationResults (estimates) {
  const votes = Object.entries(estimates)
    .map(([id, estimate]) => ({
      user: context.room.users.find(u => u.id === id),
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
    votes, summary
  })
}

main()
