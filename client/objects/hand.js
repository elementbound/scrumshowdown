import * as three from 'three'
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils'
import { DEG2RAD } from '../utils'
import AlignedElement from './aligned.element'

const STATE_EMOJIS = {
  idle: '',
  ready: '✔️',
  thumbsUp: '👍',
  thumbsDown: '👎'
}

/**
 * Represents a hand.
 */
class Hand {
  /**
   * Create a new Hand.
   * @param {object} options options
   * @param {string} options.name Hand name
   * @param {THREE.Scene} options.model Hand model
   * @param {THREE.Scene} options.scene Scene
   * @param {THREE.PerspectiveCamera} options.camera Scene camera
   * @param {string} [options.htmlClass=hand__name] HTML class for nameplate
   */
  constructor (options) {
    this._name = options.name || 'Anonymous'
    this._offset = Math.random()
    this._camera = options.camera
    this._scene = options.scene
    this._model = options.model

    const object = SkeletonUtils.clone(this._model.scene)
    this._object = object
    this._scene.add(this._object)

    this._mixer = new three.AnimationMixer(object)

    this._actions = {}
    this._model.animations.forEach(animation => {
      this._actions[animation.name] = this._mixer.clipAction(animation)
    })

    console.log('Actions', this._actions)

    const html = document.createElement('div')
    html.classList.add(options.htmlClass || 'hand__name')
    html.innerHTML = this._name
    document.body.appendChild(html)
    this._html = html

    this._rotationX = 0

    this._alignedElement = new AlignedElement(html, object.position, options.camera)

    this._state = ''

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
    this._updateHTML()
  }

  get state () {
    return this._state
  }

  set state (val) {
    if (val === this._state) {
      return
    }

    Object.values(this._actions)
      .forEach(action => { action.stop() })

    this._state = val

    this._actions[val] && this._actions[val].play()

    this._realign()
    this._updateHTML()
  }

  get object () {
    return this._object
  }

  _updateHTML () {
    this._html.innerText = `${this._name}${STATE_EMOJIS[this._state]}`
  }

  update (time) {
    const rotation = Math.sin(time.current / 2000 * Math.PI + this._offset * 2000) * 5 * DEG2RAD
    this._object.rotateY(rotation - this._rotationX)
    this._rotationX = rotation

    this._alignedElement.position = this._object.position
    this._alignedElement.update(time)

    this._mixer.update(time.elapsed)
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
