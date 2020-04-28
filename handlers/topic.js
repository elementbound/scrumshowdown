const wsRouter = require('../services/wsrouter')
const messages = require('../data/messages')

function topicHandler () {
  wsRouter.onMessage((ws, message) => {
    if (message.type !== 'Update-Topic') {
      return
    }

    const room = ws.room
    const topic = message.data.topic
    console.log('Updating room topic', { room: room.id, topic })

    room.topic = topic

    room.users
      .forEach(u => u.websocket.send(messages.updateTopic(room.topic)))
  })
}

module.exports = topicHandler
