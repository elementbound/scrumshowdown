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
  constructor (id, name, websocket) {
    this.id = id
    this.name = name
    this.websocket = websocket

    /** @member {any} */
    this.websocket = undefined
  }
}

module.exports = User
