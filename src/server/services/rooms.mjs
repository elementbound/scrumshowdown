import { nanoid } from 'nanoid'
import { config } from '../config.mjs'
import Room from '../../domain/room.mjs'
import User from '../../domain/user.mjs'

const rooms = {}

export function hasRoom (roomId) {
  return !!rooms[roomId]
}

const ROOM_ID_LENGTH = config.id.length.room
const USER_ID_LENGTH = config.id.length.user
const MAX_ID_ATTEMPTS = config.id.attempts

/**
* Generate a random id.
* @param {number} length Length
* @returns {string} Id
*/
function getId (length) {
  return nanoid(length)
}

/**
* Generate random id while making sure it's not in use already.
* @param {number} length Length
* @param {function(string):boolean} validator Validator method
* @param {number} maxAttempts Maximum number of attempts
* @returns {string} Id
*/
function getSafeId (length, validator, maxAttempts) {
  for (let attempts = 0; attempts < maxAttempts; ++attempts) {
    const id = getId(length)
    if (validator(id)) {
      return id
    }
  }

  throw Error(`Failed to generate id in ${maxAttempts} attempts!`)
}

function getRoomId () {
  return getSafeId(ROOM_ID_LENGTH, id => !hasRoom(id), MAX_ID_ATTEMPTS)
}

function getUserId () {
  return getId(USER_ID_LENGTH)
}

/**
 * Create a new Room.
 * @returns {Room} Resulting room
 */
export function createRoom () {
  const roomId = getRoomId()
  const room = new Room(roomId)

  rooms[roomId] = room
  return room
}

/**
 * Find a room by id.
 * @param {string} id Room id
 * @returns {Room} Found room, or undefined
 */
export function getRoom (id) {
  return rooms[id] || undefined
}

/**
 * Return all rooms
 * @returns {Room[]} All rooms
 */
export function listRooms () {
  return Object.values(rooms)
}

/**
 * Remove room.
 * @param {string} id Room id
 */
export function deleteRoom (id) {
  rooms[id] = undefined
}

/**
 * Join Room.
 * @param {Room} room Room
 * @param {User} user User
 * @returns {User} Joining user
 */
export function joinRoom (room, user) {
  const userId = getUserId()
  const joinedUser = new User()
  Object.assign(joinedUser, user, { id: userId })

  room.users.push(joinedUser)

  return joinedUser
}
