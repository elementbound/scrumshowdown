/* eslint-disable */
import { userRepository, UserRepository } from '../users/user.repository.mjs'
import { Participation, participationRepository, ParticipationRepository } from './participation.repository.mjs'
import { roomRepository, RoomRepository } from './room.repository.mjs'
import * as nlon from '@elementbound/nlon'
/* eslint-enable */
import { config } from '../config.mjs'
import { nanoid } from 'nanoid'
import Room from '../../domain/room.mjs'
import User from '../../domain/user.mjs'
import { getLogger } from '../../logger.mjs'
import { addParticipant, estimateResult, EstimationMessageProvider, JoinMessageProvider, KickMessageProvider, kickNotification, LeaveMessageProvider, removeParticipant, TopicMessageProvider, updateTopic } from '../../domain/messages.mjs'

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
      userId: joinUser.id
    }))
    logger.info(
      { room: room.id, user: joinUser.id, profile: User.sanitize(joinUser) },
      'Added new user to room'
    )

    // Notify joinee of participants
    const otherParticipants = this.findParticipants(room)
      .filter(p => p.id !== joinUser.id)

    logger.info('Notifying joinee of current participants')
    // TODO: Stream in one correspondence
    otherParticipants.forEach(other => {
      user.peer
        .send(JoinMessageProvider(other)())
        .finish()
    })

    // Notify other participants of joinee
    logger.info('Notifying current participants of joinee')
    this.broadcastToUsers(otherParticipants, JoinMessageProvider(joinUser))
      .forEach(corr => corr.finish())

    // Notify joinee of topic and estimation history
    logger.info('Synchronizing room state with joinee')
    joinUser.peer.send(TopicMessageProvider(room.topic)()).finish()

    // TODO: Stream in one correspondence
    room.estimations.forEach(estimation =>
      joinUser.peer.send(EstimationMessageProvider(estimation)())
    )

    return joinUser
  }

  /**
  * Leave room.
  * @param {Room} room Room
  * @param {User} user User
  * @returns {boolean} true, or false if user was not in room
  */
  // TODO: Update
  leaveRoom (room, user) {
    const logger = getLogger({
      name: 'RoomService',
      room: room.id,
      user: user.id
    })
    if (!this.#participationRepository.isUserInRoom(user.id, room.id)) {
      logger.warn('User trying to leave room they\'re not in')
      return false
    }

    // Remove user from room
    this.#participationRepository.remove(user.id)
    logger.info('Removed user from room')

    // Notify participants
    logger.info('Notifying participants of leave')
    this.broadcast(room, LeaveMessageProvider(user))
      .forEach(corr => corr.finish())

    // Try to notify leaving user
    try {
      logger.info('Notifying leaving user')
      user.peer.send(KickMessageProvider()()).finish()
    } catch (e) {
      logger.warn(
        { err: e },
        'Failed to notify user, they might have closed connection already'
      )
    }

    // Remove user
    logger.info('Removing user from repository')
    this.#userRepository.remove(user.id)

    // Cleanup empty room
    if (this.findParticipants(room).length === 0) {
      logger.info('No more users in room, removing')

      this.deleteRoom(room)
    }

    return true
  }

  /**
  * Delete room.
  * @param {Room} room Room
  */
  deleteRoom (room) {
    const logger = getLogger({ name: 'RoomService', room: room.id })

    // TODO: Reconsider limitation
    if (this.findParticipants(room).length !== 0) {
      logger.error('Trying to remove room with users still participating!')
      throw new Error('Room is not empty!')
    }

    this.#roomRepository.remove(room.id)
    logger.info('Removed room')
  }

  /**
  * Find all participants in room.
  * @param {Room} room Room
  * @returns {User[]} Participants
  */
  findParticipants (room) {
    return this.#participationRepository.findUsersInRoom(room.id)
      .map(uid => this.#userRepository.find(uid))
      .filter(user => !!user)
  }

  /**
  * Find all admins in room.
  * @param {Room} room Room
  * @returns {User[]} Admins
  */
  findRoomAdmins (room) {
    return this.findParticipants(room)
      .filter(user => user.isAdmin)
  }

  /**
  * Broadcast a message to every participant in room.
  * @param {Room} room Room
  * @param {function(): nlon.Message} messageProvder Message provider function
  * @returns {nlon.Correspondence[]} Correspondences
  */
  broadcast (room, messageProvider) {
    return this.findParticipants(room)
      .map(user => user.peer.send(messageProvider()))
  }

  /**
  * Broadcast a message to a list of users.
  * @param {User[]} users Users
  * @param {function(): nlon.Message} messageProvder Message provider function
  * @returns {nlon.Correspondence[]} Correspondences
  */
  broadcastToUsers (users, messageProvider) {
    return users.map(user => user.peer.send(messageProvider()))
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

export const roomService = new RoomService({
  userRepository,
  roomRepository,
  participationRepository
})
