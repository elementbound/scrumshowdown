import { Router } from 'express'
import { roomRepository } from '../rooms/room.repository.mjs'
const roomRouter = Router()

roomRouter.get('/:roomId', (req, res, next) => {
  const roomId = req.params.roomId
  const room = roomRepository.find(roomId)
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
