const express = require('express')
const meta = require('../services/meta')
const roomService = require('../services/rooms')
const router = express.Router()

router.get('/', (req, res, next) => {
  res.render('index', {
    version: meta.version
  })
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

  res.render('room')
})

module.exports = router
