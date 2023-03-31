import Room from '../../domain/room.mjs'
import User from '../../domain/user.mjs'

const rooms = {}

export function hasRoom (roomId) {
  return !!rooms[roomId]
}

function generateId (length) {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    '0123456789'

  return [...Array(length).keys()]
    .map(i => Math.floor(charset.length * Math.random()))
    .map(i => charset.charAt(i))
    .join('')
}

/**
 * Create a new Room.
 * @returns {Room} Resulting room
 */
export function createRoom () {
  let roomId
  for (; !roomId || hasRoom(roomId); roomId = generateId(8)) {}

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
  let userId
  for (; !userId || room.hasUser(userId); userId = generateId(8)) {}

  const joinedUser = new User()
  Object.assign(joinedUser, user, { id: userId })

  room.users.push(joinedUser)

  return joinedUser
}
