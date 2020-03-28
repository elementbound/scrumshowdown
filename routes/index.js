const express = require('express')
const roomService = require('../services/rooms')
const router = express.Router()

router.get('/', (req, res, next) => {
  res.render('index')
})

router.post('/', (req, res, next) => {
  const { roomId, name, join, create } = req.body
  res.cookie('Scrum-Name', name)

  if (create) {
    const room = roomService.createRoom()
    console.log('Created room', room)

    res.redirect(`/room/${room.id}`)
  } else if (join) {
    res.redirect(`/room/${roomId}`)
  }

  res.render('index')
})

module.exports = router
