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

    /** @member {any} */
    this.websocket = undefined

    /** @member {any} */
    this.hand = undefined
  }

  /**
   * Strip application-specific user data
   * @param {User} user Sanitized User
   */
  static sanitize (user) {
    if (!user) {
      return {}
    } else {
      return new User(user.id, user.name)
    }
  }
}

module.exports = User
