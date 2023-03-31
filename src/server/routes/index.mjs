import { Router } from 'express'
import { version as _version } from '../services/meta.mjs'
import { createRoom } from '../services/rooms.mjs'
const indexRouter = Router()

indexRouter.get('/', (req, res, next) => {
  res.render('index', {
    version: _version
  })
})

indexRouter.post('/', (req, res, next) => {
  const { roomId, name, join, create } = req.body
  res.cookie('Scrum-Name', name)

  if (create) {
    const room = createRoom()
    console.log('Created room', room)

    res.redirect(`/room/${room.id}`)
  } else if (join) {
    res.redirect(`/room/${roomId}`)
  }

  res.render('room')
})

export default indexRouter
