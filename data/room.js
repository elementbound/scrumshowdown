/**
 * Data class to represent a room.
 *
 * Rooms are where users gather for sessions.
 */
class Room {
  /**
   * Create a room with id.
   * @param {string} id Room id
   */
  constructor (id) {
    /**
     * @member {string} id Room id
     */
    this.id = id

    /**
     * @member {User[]} Participating users
     */
    this.users = []
  }

  /**
   * Check if the room has a user with given id
   * @param {string} id User id
   * @returns {boolean}
   */
  hasUser (id) {
    return this.users.some(user => user.id === id)
  }
}

module.exports = Room
