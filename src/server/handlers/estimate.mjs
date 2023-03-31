import User from '../../domain/user.mjs'
import Estimation from '../../domain/estimation.mjs'
import { onMessage } from '../../wsrouter.mjs'
import { Types, estimateDecline, estimateRequest, estimateResult, stateChange } from '../../domain/messages.mjs'

function waitForEstimate (user) {
  return new Promise((resolve, reject) => {
    const websocket = user.websocket

    websocket.once('message', data => {
      const message = JSON.parse(data)

      if (message.type === Types.EstimateResponse) {
        console.log('Estimate arrived for user', user.id)

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

    if (!room.users.every(user => user.isReady || user.isSpectator)) {
      console.log('Some users are not ready yet, declining')
      room.users.forEach(user => user.websocket.send(estimateDecline()))
      return
    }

    const votingUsers = room.users.filter(user => !user.isSpectator)

    console.log('Broadcasting estimate request')
    votingUsers.forEach(user => user.websocket.send(estimateRequest()))

    console.log(`Waiting for ${room.users.length} responses...`)
    const resultPromises = votingUsers.map(user => waitForEstimate(user))
    const results = await Promise.all(resultPromises)

    const votesData = {}
    results.forEach(({ user, data }) => {
      votesData[user.id] = data.estimate
    })

    const estimation = new Estimation(room.topic, votesData)
    room.estimations.push(estimation)

    console.log('Broadcasting results', votesData)
    room.users.forEach(user => user.websocket.send(estimateResult(estimation)))

    // Unready everyone after vote
    room.users.forEach(source => {
      source.isReady = false
      room.users.forEach(target => target.websocket.send(stateChange(source, false, source.emote)))
    })
  })
}

export default estimateHandler
