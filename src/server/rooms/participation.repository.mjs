import { Repository } from '../../repository.mjs'

export class Participation {
  roomId

  userId

  /**
  * Construct instance.
  * @param {Participation} [options] Options
  */
  constructor (options) {
    options && Object.assign(this, options)
  }
}

/**
* Repository to track room participation.
* @extends {Repository<Participation>}
*/
export class ParticipationRepository extends Repository {
  constructor () {
    super({
      idMapper: p => p.userId
    })
  }

  /**
  * Check if user is in the given room.
  * @param {string} userId User id
  * @param {string} roomId Room id
  * @returns {boolean}
  */
  isUserInRoom (userId, roomId) {
    return [this.find(userId)]
      .filter(p => !!p)
      .every(p => p.roomId === roomId)
  }

  /**
  * Find every user in a given room.
  * @param {string} roomId Room id
  * @returns {string[]} User id's
  */
  findUsersInRoom (roomId) {
    return [...this.list()]
      .filter(p => p.roomId === roomId)
      .map(p => p.userId)
  }
}

export const participationRepository = new ParticipationRepository()
