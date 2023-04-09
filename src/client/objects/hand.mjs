import three from 'three'
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { getLogger } from '../../logger.mjs'
import { DEG2RAD } from '../utils'
import AlignedElement from './aligned.element'

const logger = getLogger({ name: 'Hand' })

const STATE_EMOJIS = {
  idle: '',
  ready: '✔️',
  thumbsUp: '👍',
  thumbsDown: '👎'
}

const ADMIN_EMOJI = '👑'
const SPECTATOR_EMOJI = '👁️'

/**
 * Represents a hand.
 */
class Hand {
  /**
   * Create a new Hand.
   * @param {object} options options
   * @param {string} options.name Hand name
   * @param {string} options.color Color
   * @param {THREE.Scene} options.model Hand model
   * @param {THREE.Scene} options.scene Scene
   * @param {THREE.PerspectiveCamera} options.camera Scene camera
   * @param {string} [options.htmlClass=hand__name] HTML class for nameplate
   * @param {boolean} [options.isAdmin=false] Is Admin?
   * @param {boolean} [options.isSpectator=false] Is Spectator?
   */
  constructor (options) {
    this._name = options.name || 'Anonymous'
    this._color = 0xffffff
    this._offset = Math.random()
    this._camera = options.camera
    this._scene = options.scene
    this._model = options.model
    this._isAdmin = options.isAdmin || false
    this._isSpectator = options.isSpectator || false

    this._material = new three.MeshStandardMaterial({
      color: this._color,
      metalness: 0,
      roughness: 0.65,
      skinning: true
    })

    const object = SkeletonUtils.clone(this._model.scene)
    this._object = object
    this._scene.add(this._object)

    this._object.traverse(o => {
      if (o.name === 'Cube') {
        o.material = this._material
      }
    })

    this._mixer = new three.AnimationMixer(object)

    this._actions = {}
    this._model.animations.forEach(animation => {
      this._actions[animation.name] = this._mixer.clipAction(animation)
    })

    logger.info({ actions: this._actions }, 'Loaded actions')

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
    this.color = options.color || 0xffffff
  }

  get name () {
    return this._name
  }

  set name (val) {
    this._name = val
    this._updateHTML()
  }

  get color () {
    return this._color
  }

  set color (val) {
    this._color = new three.Color(val)
    this._material.color = this._color
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

  get isAdmin () {
    return this._isAdmin
  }

  set isAdmin (val) {
    this._isAdmin = !!val
    this._updateHTML()
  }

  get isSpectator () {
    return this._isSpectator
  }

  set isSpectator (val) {
    this._isSpectator = !!val
    this._updateHTML()
  }

  get object () {
    return this._object
  }

  _updateHTML () {
    this._html.innerText =
      `${this._name}${STATE_EMOJIS[this._state]}` +
      `${this._isSpectator ? SPECTATOR_EMOJI : ''}` +
      `${this._isAdmin ? ADMIN_EMOJI : ''}`
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
