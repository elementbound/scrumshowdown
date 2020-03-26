import * as three from 'three'
import { DEG2RAD, loadGLTF, clamp } from './utils'

export const context = {
  scene: undefined,
  renderer: undefined,
  camera: undefined,

  models: {
    hand: undefined
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

/**
 * Aligns an HTML element to a point in space
 * @param {HTMLElement} node HTML element to align
 * @param {three.Vector3} position point in space
 * @param {three.Camera} camera camera
 */
function alignNode (node, position, camera) {
  const projected = new three.Vector3(position.x, position.y, position.z)
  projected.project(camera)

  const horizontalMargin = node.offsetWidth / window.innerWidth
  const verticalMargin = node.offsetHeight / window.innerHeight
  const x = clamp((1 + projected.x) / 2, horizontalMargin, 1 - horizontalMargin)
  const y = clamp((1 - projected.y) / 2, verticalMargin, 1 - verticalMargin)

  node.style.left = `${x * 100}vw`
  node.style.top = `${y * 100}vh`
}

function init () {
  const content = document.querySelector('.content')
  const scene = new three.Scene()
  const camera = new three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  const renderer = new three.WebGLRenderer({ alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)

  context.scene = scene
  context.camera = camera
  context.renderer = renderer

  content.appendChild(renderer.domElement)

  scene.color = new three.Color(0xffffff00)
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

  const handModel = await loadGLTF('/assets/hand.glb')
  context.models.hand = handModel.scene

  const light = new three.HemisphereLight('white', 'black', 1)
  context.objects.light = light

  light.position.x = 0
  light.position.y = 0
  light.position.z = 1

  scene.add(light)

  // camera.position.z = (2 * handDistance) / (2 * Math.tan(camera.fov / 2 * DEG2RAD))
  camera.position.z = 2
}

/**
 * Align hands around the screen.
 *
 * @param {three.Object3D[]} hands Hand objects
 */
function alignHands (hands) {
  const handCount = hands.length
  const handWidth = 1.5

  const aspect = context.camera.aspect

  console.log(`Realigning with ${handCount} hands`)

  const distanceScale = Math.max(
    (handWidth * handCount) / (2 + aspect),
    2
  )

  hands.forEach((hand, i) => {
    const angle = (i + Math.random() / 2) / hands.length * 2 * Math.PI

    const dirVec = [-Math.cos(angle), -Math.sin(angle)]
    const maxComponent = dirVec
      .map(a => Math.abs(a))
      .reduce((a, b) => Math.max(a, b))
    const position = dirVec
      .map(a => a / maxComponent)
      .map(a => a * distanceScale)
    position[0] *= aspect

    hand.rotation.z = angle - Math.PI / 2
    hand.position.x = position[0]
    hand.position.y = position[1]
  })

  return distanceScale
}

function update (time) {
  const { camera } = context

  context.objects.hands.forEach(hand => {
    const object = hand.object
    const position = object.position
    const node = hand.html

    object.rotateX(Math.cos(time.current / 2000 * Math.PI + hand.offset * 2000) * 10 * DEG2RAD * time.elapsed / 1000)

    alignNode(node, position, camera)
  })
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
 */
export function addHand (hand) {
  const { scene } = context
  const hands = context.objects.hands
  const model = context.models.hand

  const result = {
    data: hand,
    object: model.clone(),
    html: document.createElement('div'),

    offset: Math.random()
  }

  result.html.innerText = hand.name
  result.html.classList.add('hand__name')

  document.body.appendChild(result.html)
  scene.add(result.object)

  hands.push(result)
  updateHands()
}

export function updateHands () {
  const handObjects = context.objects.hands
    .map(hand => hand.object)

  const handDistance = alignHands(handObjects)

  const { camera } = context
  camera.position.z = (2 * handDistance) / (2 * Math.tan(camera.fov / 2 * DEG2RAD))
}

export async function render () {
  init()

  window.onresize = () =>
    resize(window.innerWidth, window.innerHeight)

  await setupScene()
  loop()
}
