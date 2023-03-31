import * as three from 'three'
import { clamp } from '../utils'

/**
 * Keeps an HTML Element aligned to a given point in 3D space.
 */
class AlignedElement {
  /**
   * Create an AlignedElement.
   * @param {HTMLElement} element HTML element to align
   * @param {three.Vector3} position point in space
   * @param {three.Camera} camera camera
   */
  constructor (element, position, camera) {
    this._element = element
    this.position = position
    this.camera = camera
  }

  update (time) {
    const { position, camera } = this
    const element = this._element

    const projected = new three.Vector3(position.x, position.y, position.z)
    projected.project(camera)

    const horizontalMargin = element.offsetWidth / window.innerWidth
    const verticalMargin = element.offsetHeight / window.innerHeight
    const x = clamp((1 + projected.x) / 2, horizontalMargin, 1 - horizontalMargin)
    const y = clamp((1 - projected.y) / 2, verticalMargin, 1 - verticalMargin)

    element.style.left = `${x * 100}vw`
    element.style.top = `${y * 100}vh`
  }

  dispose () {
  }
}

export default AlignedElement
