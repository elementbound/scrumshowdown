import { UserRepository } from '../users/user.repository.mjs'
import { Participation, ParticipationRepository } from './participation.repository.mjs'
import { RoomRepository } from './room.repository.mjs'
import { config } from '../config.mjs'
import { nanoid } from 'nanoid'
import Room from '../../domain/room.mjs'
import User from '../../domain/user.mjs'
import { getLogger } from '../../logger.mjs'

export class RoomService {
  #userRepository
  #roomRepository
  #participationRepository

  /**
  * Construct room service.
  * @param {object} options Options
  * @param {UserRepository} options.userRepository User repository
  * @param {RoomRepository} options.roomRepository Room repository
  * @param {ParticipationRepository} options.participationRepository Participation repository
  */
  constructor (options) {
    this.#userRepository = options.userRepository
    this.#roomRepository = options.roomRepository
    this.#participationRepository = options.participationRepository
  }

  /**
  * Create a room.
  * @returns {Room} Room
  */
  createRoom () {
    const logger = getLogger({ name: 'RoomService' })

    const id = this.#generateRoomId()
    const room = new Room(id)

    this.#roomRepository.add(room)
    logger.info({ room: room.id }, 'Created room')

    return room
  }

  /**
  * Join room.
  * @param {Room} room Room
  * @param {User} user Joining user
  * @returns {User} Saved user
  */
  joinRoom (room, user) {
    const logger = getLogger({ name: 'RoomService' })

    const joinUser = new User()
    Object.assign(joinUser, user, { id: this.#generateUserId() })

    this.#userRepository.add(joinUser)
    this.#participationRepository.add(new Participation({
      roomId: room.id,
      userId: user.id
    }))
    logger.info(
      { room: room.id, user: joinUser.id, profile: User.sanitize(joinUser) },
      'Added new user to room'
    )

    return joinUser
  }

  /**
  * Leave room.
  * @param {Room} room Room
  * @param {User} user User
  */
  leaveRoom (room, user) {
    const logger = getLogger({ name: 'RoomService', room: room.id, user: user.id })
    if (!this.#participationRepository.isUserInRoom(user.id, room.id)) {
      logger.warn('User trying to leave room they\'re not in')
      return
    }

    this.#participationRepository.remove(user.id)
    logger.info('Removed user from room')

    if (this.#participationRepository.findUsersInRoom(room.id).length === 0) {
      logger.info('No more users in room, removing')

      this.deleteRoom(room)
    }
  }

  /**
  * Delete room.
  * @param {Room} room Room
  */
  deleteRoom (room) {
    const logger = getLogger({ name: 'RoomService', room: room.id })

    // TODO: Reconsider limitation
    if (this.#participationRepository.findUsersInRoom(room.id).length !== 0) {
      logger.error('Trying to remove room with users still participating!')
      throw new Error('Room is not empty!')
    }

    this.#roomRepository.remove(room.id)
    logger.info('Removed room')
  }

  #generateRoomId () {
    const maxAttempts = config.id.attempts
    const length = config.id.length.room

    for (let attempts = 0; attempts < maxAttempts; ++attempts) {
      const id = nanoid(length)
      if (!this.#roomRepository.has(id)) {
        return id
      }
    }

    throw Error(`Failed to generate id in ${maxAttempts} attempts!`)
  }

  #generateUserId () {
    return nanoid(config.id.length.user)
  }
}
