const express = require('express')
const roomService = require('../services/rooms')
const router = express.Router()

router.get('/:roomId', (req, res, next) => {
  const roomId = req.params.roomId
  const room = roomService.getRoom(roomId)
  const username = req.cookies['Scrum-Name']

  if (!room) {
    res.redirect('/')
    return
  }

  const user = roomService.joinRoom(room, username)

  res.render('room', {
    userId: user.id,
    userName: user.name,
    roomId: room.id
  })
})

module.exports = router
