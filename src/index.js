import * as three from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const context = {
  scene: undefined,
  renderer: undefined,
  camera: undefined,

  objects: {
    hands: []
  }
}

const DEG2RAD = Math.PI / 180

function range (n) {
  return [...Array(n).keys()]
}

function loadGLTF (url, onProgress) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    loader.load(url,
      gltf => resolve(gltf),
      onProgress || (() => {}),
      err => reject(err))
  })
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

  alignHands()
}

async function setupScene () {
  const { scene, camera } = context

  const handModel = await loadGLTF('/assets/hand.glb')
  const handCount = 12

  const hands = range(handCount)
    .map(() => handModel.scene.clone())

  hands.forEach(hand => scene.add(hand))
  context.objects.hands = hands
  const handDistance = alignHands()

  const light = new three.HemisphereLight('white', 'black', 1)

  light.position.x = 0
  light.position.y = 0
  light.position.z = 1

  scene.add(light)

  camera.position.z = (2 * handDistance) / (2 * Math.tan(camera.fov / 2 * DEG2RAD))
  console.log({
    scale: handDistance,
    z: camera.position.z,
    fov: camera.fov / 2,
    tan: Math.tan(camera.fov / 2 * DEG2RAD)
  })
}

function alignHands () {
  const hands = context.objects.hands
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

function update () {
}

function loop () {
  const { renderer, scene, camera } = context

  update()

  renderer.render(scene, camera)
  requestAnimationFrame(loop)
}

async function main () {
  init()

  window.onresize = () =>
    resize(window.innerWidth, window.innerHeight)

  await setupScene()
  loop()
}

main()
