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
     * @member {string} topic Room topic
     */
    this.topic = ''

    /**
     * @member {Estimation[]} estimations Previous estimations with results
     */
    this.estimations = []
  }
}

export default Room
