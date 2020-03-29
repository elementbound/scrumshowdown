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
    const state = message.data.state

    console.log('User requesting to change state', { user: User.sanitize(user), state })

    room.users
      .forEach(u => u.websocket.send(messages.stateChange(user, state)))
  })
}

module.exports = stateHandler
