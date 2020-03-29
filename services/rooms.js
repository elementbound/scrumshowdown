const Room = require('../data/room')
const User = require('../data/user')

const rooms = {}

function hasRoom (roomId) {
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
function createRoom () {
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
function getRoom (id) {
  return rooms[id] || undefined
}

/**
 * Return all rooms
 * @returns {Room[]} All rooms
 */
function listRooms () {
  return Object.values(rooms)
}

/**
 * Remove room.
 * @param {string} id Room id
 */
function deleteRoom (id) {
  rooms[id] = undefined
}

/**
 * Join Room.
 * @param {Room} room Room
 * @param {string} username Username
 * @returns {User} Joining user
 */
function joinRoom (room, username) {
  let userId
  for (; !userId || room.hasUser(userId); userId = generateId(8)) {}

  const user = new User(userId, username)
  room.users.push(user)

  return user
}

module.exports = {
  hasRoom,
  createRoom,
  getRoom,
  listRooms,
  deleteRoom,
  joinRoom
}
