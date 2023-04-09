import three from 'three'
import { loadGLTF } from './utils'

export const context = {
  scene: undefined,
  renderer: undefined,
  camera: undefined,

  models: {
    hand: undefined
  },

  objects: [],

  time: {
    current: 0,
    elapsed: 0
  }
}

function init () {
  const content = document.querySelector('.content')
  const scene = new three.Scene()
  const camera = new three.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000)
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
  context.models.hand = await loadGLTF('/assets/hand.glb')
}

function resize (width, height) {
  const { renderer, camera } = context

  renderer.setSize(width, height)

  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

async function setupScene () {
  const { scene, camera } = context

  const light = new three.HemisphereLight('white', 'black', 1)

  light.position.x = 0
  light.position.y = 0
  light.position.z = 1

  scene.add(light)

  camera.position.z = 2
}

function update (time) {
  context.objects.forEach(object => object.update(time))
}

function loop (time) {
  const { renderer, scene, camera } = context

  context.time.elapsed = time - context.time.current
  context.time.current = time
  update(context.time)

  renderer.render(scene, camera)
  requestAnimationFrame(loop)
}

export async function startLoop () {
  init()
  await loadModels()

  window.onresize = () =>
    resize(window.innerWidth, window.innerHeight)

  await setupScene()
  loop()
}
