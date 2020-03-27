import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export const DEG2RAD = Math.PI / 180
export const RAD2DEG = 180 / Math.PI

export function range (n) {
  return [...Array(n).keys()]
}

export function clamp (x, min, max) {
  return Math.max(Math.min(max, x), min)
}

export function loadGLTF (url, onProgress) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    loader.load(url,
      gltf => resolve(gltf),
      onProgress || (() => {}),
      err => reject(err))
  })
}
