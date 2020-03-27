import * as three from 'three'
import { DEG2RAD, loadGLTF } from './utils'
import Hand from './objects/hand'

export const context = {
  scene: undefined,
  renderer: undefined,
  camera: undefined,

  models: {
    hand: {
      idle: undefined,
      ready: undefined,
      thumbsUp: undefined,
      thumbsDown: undefined
    }
  },

  objects: {
    hands: [],
    light: undefined
  },

  time: {
    current: 0,
    elapsed: 0
  }
}

function init () {
  const content = document.querySelector('.content')
  const scene = new three.Scene()
  const camera = new three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  const renderer = new three.WebGLRenderer({
    alpha: true,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)

  context.scene = scene
  context.camera = camera
  context.renderer = renderer

  content.appendChild(renderer.domElement)

  scene.color = new three.Color(0xffffff00)
}

async function loadModels () {
  context.models.hand = {
    idle: await loadGLTF('/assets/hand-idle.glb'),
    ready: await loadGLTF('/assets/hand-ready.glb'),
    thumbsUp: await loadGLTF('/assets/hand-thumbsup.glb'),
    thumbsDown: await loadGLTF('/assets/hand-thumbsdown.glb')
  }
}

function resize (width, height) {
  const { renderer, camera } = context

  console.log('Resizing to', { width, height })
  renderer.setSize(width, height)

  camera.aspect = width / height
  camera.updateProjectionMatrix()

  updateHands()
}

async function setupScene () {
  const { scene, camera } = context

  const light = new three.HemisphereLight('white', 'black', 1)
  context.objects.light = light

  light.position.x = 0
  light.position.y = 0
  light.position.z = 1

  scene.add(light)

  camera.position.z = 2
}

/**
 * Align hands around the screen.
 *
 * @param {Hand[]} hands Hand objects
 */
function alignHands (hands) {
  const handCount = hands.length

  console.log(`Realigning with ${handCount} hands`)

  const scale = Hand.calculateScale(handCount, context.camera)
  hands.forEach((hand, i) => hand.align(i, handCount, scale))

  return scale
}

/**
 * Update all hands.
 */
export function updateHands () {
  const handDistance = alignHands(context.objects.hands)

  const { camera } = context
  camera.position.z = (2 * handDistance) / (2 * Math.tan(camera.fov / 2 * DEG2RAD))
}

function update (time) {
  context.objects.hands.forEach(hand => hand.update(time))
}

function loop (time) {
  const { renderer, scene, camera } = context

  context.time.elapsed = time - context.time.current
  context.time.current = time
  update(context.time)

  renderer.render(scene, camera)
  requestAnimationFrame(loop)
}

/**
 * Add a hand to the scene.
 *
 * @param {object} hand Hand data
 * @param {string} hand.name Username
 * @returns {Hand} Resulting Hand
 */
export function addHand (hand) {
  const hands = context.objects.hands

  const newHand = new Hand(Object.assign({}, hand, {
    camera: context.camera,
    scene: context.scene,
    models: context.models.hand
  }))

  hands.push(newHand)
  updateHands()

  return newHand
}

export async function render () {
  init()
  await loadModels()

  window.onresize = () =>
    resize(window.innerWidth, window.innerHeight)

  await setupScene()
  loop()
}
