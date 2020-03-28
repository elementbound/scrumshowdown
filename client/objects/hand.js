import * as three from 'three'
import { DEG2RAD, sample } from '../utils'
import AlignedElement from './aligned.element'

/**
 * Represents a hand.
 */
class Hand {
  /**
   * Create a new Hand.
   * @param {object} options options
   * @param {string} options.name Hand name
   * @param {Map<string, THREE.Object3D>} options.models Idle hand model
   * @param {THREE.Scene} options.scene Scene
   * @param {THREE.PerspectiveCamera} options.camera Scene
   * @param {string} [options.htmlClass=hand__name] HTML class for nameplate
   */
  constructor (options) {
    this._name = options.name || 'Anonymous'
    this._offset = Math.random()
    this._camera = options.camera
    this._scene = options.scene

    const object = new three.Object3D()
    this._object = object

    const html = document.createElement('div')
    html.classList.add(options.htmlClass || 'hand__name')
    html.innerHTML = this._name
    document.body.appendChild(html)
    this._html = html

    this._rotationX = 0

    this._alignedElement = new AlignedElement(html, object.position, options.camera)

    this._state = ''
    this._models = options.models

    this._align = {
      index: 0,
      count: 1,
      scale: 2
    }

    this.state = 'idle'
  }

  get name () {
    return this._name
  }

  set name (val) {
    this._name = val
    this._html.innerText = this._name
  }

  get state () {
    return this._state
  }

  set state (val) {
    if (val === this._state) {
      return
    }

    this._scene.remove(this._object)

    this._state = val
    this._object = this._models[this._state].scene.clone()

    this._realign()

    this._scene.add(this._object)
  }

  get object () {
    return this._object
  }

  update (time) {
    const rotation = Math.sin(time.current / 2000 * Math.PI + this._offset * 2000) * 5 * DEG2RAD
    this._object.rotateY(rotation - this._rotationX)
    this._rotationX = rotation

    this._alignedElement.position = this._object.position
    this._alignedElement.update(time)

    if (Math.random() < 0.01) {
      this.state = sample(...Object.keys(this._models))
    }
  }

  dispose () {
    this._scene.remove(this._object)
    this._html.remove()
    this._alignedElement.dispose()
  }

  /**
   * Aligns the hand on the edge of the screen
   * @param {number} index hand index
   * @param {number} count count of all hands
   */
  align (index, count, scale) {
    this._align = {
      index,
      count,
      scale
    }

    const aspect = this._camera.aspect
    const angle = (index + this._offset / 2) / count * 2 * Math.PI

    const dirVec = [-Math.cos(angle), -Math.sin(angle)]
    const maxComponent = dirVec
      .reduce((a, b) => Math.max(Math.abs(a), Math.abs(b)))
    const position = dirVec
      .map(a => a / maxComponent * scale)
    position[0] *= aspect

    this._object.position.x = position[0]
    this._object.position.y = position[1]

    this._object.rotation.z = angle + Math.PI
  }

  _realign () {
    const { index, count, scale } = this._align
    this.align(index, count, scale)
  }

  static calculateScale (count, camera) {
    const width = 1.5

    return Math.max((width * count) / (2 + camera.aspect), 2)
  }
}

export default Hand
