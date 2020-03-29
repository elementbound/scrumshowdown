const User = require('../data/user')
const wsRouter = require('../services/wsrouter')
const messages = require('../services/participant.messages')

function waitForEstimate (user) {
  return new Promise((resolve, reject) => {
    const websocket = user.websocket

    websocket.once('message', data => {
      const message = JSON.parse(data)

      if (message.type === 'Estimate-Response') {
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
  wsRouter.onMessage(async (ws, message) => {
    if (message.type !== 'Estimate-Request') {
      return
    }

    const room = ws.room

    if (!room.users.every(user => user.isReady)) {
      console.log('Some users are not ready yet, declining')
      room.users.forEach(user => user.websocket.send(messages.estimateDecline()))
      return
    }

    console.log('Broadcasting estimate request')
    room.users.forEach(user => user.websocket.send(messages.estimateRequest()))

    console.log(`Waiting for ${room.users.length} responses...`)
    const resultPromises = room.users.map(user => waitForEstimate(user))
    const results = await Promise.all(resultPromises)

    const responseData = {}
    results.forEach(({ user, data }) => {
      responseData[user.id] = data.estimate
    })

    console.log('Broadcasting results', responseData)
    room.users.forEach(user => user.websocket.send(messages.estimateResult(responseData)))
  })
}

module.exports = estimateHandler
