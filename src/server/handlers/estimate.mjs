import User from '../../domain/user.mjs'
import Estimation from '../../domain/estimation.mjs'
import { onMessage } from '../../wsrouter.mjs'
import { Types, estimateDecline, estimateRequest, estimateResult, stateChange } from '../../domain/messages.mjs'
import { getLogger } from '../../logger.mjs'
import { roomService } from '../rooms/room.service.mjs'

function waitForEstimate (user, logger) {
  logger ??= getLogger({ name: 'waitForEstimate' })

  return new Promise((resolve, reject) => {
    const websocket = user.websocket

    websocket.once('message', data => {
      const message = JSON.parse(data)

      if (message.type === Types.EstimateResponse) {
        logger.info('Estimate arrived for user %s', user.id)

        resolve({
          user: User.sanitize(user),
          data: message.data
        })
      }
    })
  })
}

function estimateHandler () {
  onMessage(async (ws, message) => {
    if (message.type !== Types.EstimateRequest) {
      return
    }

    const room = ws.room
    const logger = getLogger({
      name: 'estimateHandler',
      room: room?.id
    })

    const participants = roomService.findParticipants(room)
    const votingUsers = participants.filter(user => !user.isSpectator)

    if (!votingUsers.every(user => user.isReady)) {
      logger.info('Some users are not ready yet, declining')
      participants.forEach(user => user.websocket.send(estimateDecline()))
      return
    }

    logger.info('Broadcasting estimate request')
    votingUsers.forEach(user => user.websocket.send(estimateRequest()))

    logger.info('Waiting for %d responses', votingUsers.length)
    const resultPromises = votingUsers.map(user => waitForEstimate(user, logger))
    const results = await Promise.all(resultPromises)

    const votesData = {}
    results.forEach(({ user, data }) => {
      votesData[user.id] = data.estimate
    })

    const estimation = new Estimation(room.topic, votesData)
    room.estimations.push(estimation)

    logger.info({ votes: votesData }, 'Broadcasting results')
    roomService.broadcast(room, estimateResult(estimation))

    // Unready everyone after vote
    participants
      .filter(p => p.isReady)
      .forEach(source => {
        source.isReady = false
        roomService.broadcast(room, stateChange(source, false, source.emote))
      })
  })
}

export default estimateHandler
