/**
 * Data class to represent a participant within a room.
 *
 * Users _should_ have unique ID's within the room they are in.
 */
class User {
  /**
   * Create a new User.
   * @param {string} id User id
   * @param {string} name User name
   */
  constructor (id, name) {
    this.id = id
    this.name = name

    /** @member {boolean} */
    this.isReady = false

    /** @member {string} */
    this.emote = ''

    /** @member {any} */
    this.websocket = undefined

    /** @member {any} */
    this.hand = undefined
  }

  /**
   * Strip application-specific user data.
   *
   * This version of the object is safe for printing or transmitting.
   * @param {User} user Sanitized User
   */
  static sanitize (user) {
    if (!user) {
      return {}
    } else {
      const result = new User(user.id, user.name)
      result.isReady = user.isReady
      result.emote = user.emote

      return result
    }
  }
}

module.exports = User
