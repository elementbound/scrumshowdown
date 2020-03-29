const wsRouter = require('../services/wsrouter')
const messages = require('../services/participant.messages')
const User = require('../data/user')

function stateHandler () {
  wsRouter.onMessage((ws, message) => {
    if (message.type !== 'State-Change-Request') {
      return
    }

    const room = ws.room
    const user = ws.user
    const { isReady, emote } = message.data

    console.log('User requesting to change state', { user: User.sanitize(user), isReady, emote })

    user.isReady = isReady
    user.emote = emote

    room.users
      .forEach(u => u.websocket.send(messages.stateChange(user, isReady, emote)))
  })
}

module.exports = stateHandler
