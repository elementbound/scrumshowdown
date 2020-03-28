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
  }
}

module.exports = User
