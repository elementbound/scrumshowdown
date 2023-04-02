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

    /** @member {boolean} */
    this.isAdmin = false

    /** @member {boolean} */
    this.isSpectator = false

    /** @member {string} */
    this.emote = ''

    /** @member {string} */
    this.color = ''

    /** @member {any} websocket [server] Websocket connection */
    this.websocket = undefined

    /** @member {any} hand [client] Hand model used on the frontend */
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
      const removeKeys = [
        'websocket',
        'hand'
      ]

      const safeEntries = Object.entries(user)
        .filter(([key, _]) => !removeKeys.includes(key))

      return Object.fromEntries(safeEntries)
    }
  }
}

export default User
