import Mustache from 'mustache'

const Badges = Object.freeze({
  Admin: '👑',
  Spectator: '👁️'
})

const HTML_TEMPLATE = `
<div class="users__item">
  {{name}} {{badges}}

  <span class="users__tools">
      <button class="action admin-promote" title="Promote to admin">👑</button>
      <button class="action admin-toggle-spectator" title="Toggle spectator">👁️</button>
      <button class="action admin-kick" title="Kick">🦵</button>
  </span>
</div>
`

export default class UserAdminItem extends HTMLElement {
  constructor () {
    super()
    this._update()
  }

  get name () {
    return this.getAttribute('name')
  }

  set name (val) {
    this.setAttribute('name', val)
    this._update()
  }

  get isAdmin () {
    return this.getAttribute('admin') === 'true'
  }

  set isAdmin (val) {
    this.setAttribute('admin', !!val)
    this._update()
  }

  get isSpectator () {
    return this.getAttribute('spectator') === 'true'
  }

  set isSpectator (val) {
    this.setAttribute('spectator', !!val)
    this._update()
  }

  _update () {
    const badges = [
      this.isAdmin ? Badges.Admin : '',
      this.isSpectator ? Badges.Spectator : ''
    ].join('')

    this.innerHTML = Mustache.render(HTML_TEMPLATE, {
      name: this.name,
      badges
    })
  }

  static define (name) {
    customElements.define(name || 'user-admin-item', UserAdminItem)
  }
}
