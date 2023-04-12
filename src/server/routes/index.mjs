import { Router } from 'express'
import { getLogger } from '../../logger.mjs'
import { roomService } from '../rooms/room.service.mjs'
import { version } from '../services/meta.mjs'

const indexRouter = Router()
const logger = getLogger({ name: 'indexRouter' })

indexRouter.get('/', (req, res, next) => {
  res.render('index', { version })
})

indexRouter.post('/', (req, res, next) => {
  const { roomId, name, join, create } = req.body
  res.cookie('Scrum-Name', name)

  if (create) {
    const room = roomService.createRoom()
    logger.info({ room }, 'Created room')

    res.redirect(`/room/${room.id}`)
  } else if (join) {
    res.redirect(`/room/${roomId}`)
  }

  res.render('room')
})

export default indexRouter
