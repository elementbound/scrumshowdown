import User from '../data/user'
import Room from '../data/room'
import Hand from './objects/hand'
import * as render from './render'
import { DEG2RAD } from './utils'
import * as messages from '../services/participant.messages'

const context = {
  room: new Room(undefined),
  user: new User(undefined, undefined)
}

const messageHandlers = {
  'Confirm-Join': confirmJoinHandler,
  'Add-Participant': addParticipantHandler,
  'Remove-Participant': removeParticipantHandler,
  'State-Change': stateChangeHandler
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
}

function sendStateChange (state) {
  return function () {
    console.log('Sending state', state)
    context.user.websocket.send(messages.stateChangeRequest(state))
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
  document.querySelector('.action.idle').onclick = sendStateChange('idle')
  document.querySelector('.action.ready').onclick = sendStateChange('ready')
  document.querySelector('.action.thumbsup').onclick = sendStateChange('thumbsUp')
  document.querySelector('.action.thumbsdown').onclick = sendStateChange('thumbsDown')
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
function stateChangeHandler ({ id, state }) {
  const user = context.room.users.find(u => u.id === id)
  user.hand.state = state
}

main()
