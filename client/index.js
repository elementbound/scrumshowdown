import User from '../data/user'
import Hand from './objects/hand'
import * as render from './render'
import { DEG2RAD } from './utils'

/** @type {Map<string, User>} */
const users = {}

/** @type {Map<string, Hand>} */
const hands = {}

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
  const handDistance = alignHands(Object.values(hands))

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

  const userId = document.querySelector('.data.user-id').innerHTML
  const userName = document.querySelector('.data.user-name').innerHTML
  const roomId = document.querySelector('.data.room-id').innerHTML

  console.log({
    userId,
    userName,
    roomId
  })

  console.log('Connecting to WS...')
  const webSocket = new WebSocket(`ws://localhost:3000/rooms/${roomId}`)
  webSocket.onopen = () => {
    console.log('Socket open!')

    webSocket.send(JSON.stringify({
      type: 'Join',
      data: {
        roomId
      }
    }))
  }

  webSocket.onmessage = event => {
    const message = JSON.parse(event.data)
    console.log('Received message', message)

    if (message.type === 'Update-Participants') {
      participantsHandler(message.data)
    }
  }
}

/**
 * Handle 'Response/Participants' message.
 * @param {User[]} participants participants
 */
function participantsHandler (participants) {
  console.log('Received participants', participants)

  // Remove users that have left
  Object.keys(users)
    .filter(userId => !participants.some(user => user.id === userId))
    .forEach(userId => {
      console.log(`Removing user ${userId}`)
      users[userId] = undefined

      render.context.objects = render.context.objects.filter(object => object !== hands[userId])
      hands[userId].dispose()
      hands[userId] = undefined
    })

  // Add users that are not present
  const { camera, scene } = render.context
  const models = render.context.models.hand

  participants
    .filter(user => !users[user.id])
    .forEach(user => {
      console.log(`Adding user ${user.id}`)

      const hand = new Hand({
        name: user.name,
        camera,
        models,
        scene
      })

      users[user.id] = user
      hands[user.id] = hand

      render.context.objects.push(hand)
    })

  updateHands()
}

main()
