import UserAdminItem from './user.admin.item.mjs'
import * as events from '../events.mjs'

export default class UserAdmin extends HTMLElement {
  constructor () {
    super()

    this._users = []
  }

  add (user) {
    const userItem = new UserAdminItem()
    userItem.name = user.name
    userItem.isAdmin = user.isAdmin
    userItem.isSpectator = user.isSpectator

    userItem.onKick = () => events.Source.emit(events.Types.AdminKick, user)
    userItem.onPromote = () => events.Source.emit(events.Types.AdminPromote, user)
    userItem.onToggleSpectator = () => {
      events.Source.emit(events.Types.AdminSpectatorToggle, user)
    }

    this.appendChild(userItem)

    this._users.push({
      user, item: userItem
    })
  }

  remove (user) {
    const entry = this._users.find(entry => entry.user === user)

    if (entry) {
      this.removeChild(entry.item)
      this._users = this._users.filter(e => e !== entry)
    }
  }

  findElementOf (user) {
    const entry = this._users.find(e => e.user === user)

    return entry
      ? entry.item
      : undefined
  }

  get users () {
    return this._users
      .map(entry => entry.user)
  }

  get userEntries () {
    return [...this._users]
  }

  static define (name) {
    customElements.define(name || 'user-admin', UserAdmin)
  }
}
