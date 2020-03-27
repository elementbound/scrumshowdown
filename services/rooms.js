const Room = require('../data/room')

const rooms = {}

function hasRoom (roomId) {
  return !!rooms[roomId]
}

function generateRoomId () {
  const length = 8
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    '0123456789'

  return [...Array(length).keys()]
    .map(i => Math.floor(charset.length * Math.random()))
    .map(i => charset.charAt(i))
    .join('')
}

function createRoom () {
  let roomId
  for (; roomId && hasRoom(roomId); roomId = generateRoomId()) {}

  const room = new Room(roomId)

  rooms[roomId] = room
  return room
}

function getRoom (id) {
  return rooms[id] || undefined
}

function deleteRoom (id) {
  rooms[id] = undefined
}

module.exports = {
  hasRoom,
  createRoom,
  getRoom,
  deleteRoom
}
