import { Router } from 'express'
import { getRoom } from '../services/rooms.mjs'
const roomRouter = Router()

roomRouter.get('/:roomId', (req, res, next) => {
  const roomId = req.params.roomId
  const room = getRoom(roomId)
  const username = req.cookies['Scrum-Name']

  if (!room) {
    res.redirect('/')
    return
  }

  res.render('room', {
    userName: username,
    roomId: room.id
  })
})

export default roomRouter
