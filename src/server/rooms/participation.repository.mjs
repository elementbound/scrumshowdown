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
*/
export class ParticipationRepository extends Repository {
  constructor () {
    super({
      idMapper: p => p.userId
    })
  }
}

export const participationRepository = new ParticipationRepository()
