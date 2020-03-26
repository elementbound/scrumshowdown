import * as three from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const context = {
  scene: undefined,
  renderer: undefined,
  camera: undefined,

  objects: {}
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
}

async function setupScene () {
  const { scene, camera } = context

  const hand = await loadGLTF('/assets/hand.gltf')
  scene.add(hand.scene)
  context.objects.cube = hand.scene

  const light = new three.HemisphereLight('white', 'black', 1)

  light.position.x = 0
  light.position.y = 0
  light.position.z = 1

  scene.add(light)

  camera.position.z = 5
}

function update () {
  const cube = context.objects.cube

  cube.rotation.x += 0.01
  cube.rotation.y += 0.01
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
