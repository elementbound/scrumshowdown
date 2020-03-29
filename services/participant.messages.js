const User = require('../data/user')

function join (username, roomId) {
  return {
    type: 'Join',
    data: {
      roomId, username
    }
  }
}

/**
 * Create a Confirm Join message.
 * @param {User} user User
 */
function confirmJoin (user) {
  return {
    type: 'Confirm-Join',
    data: {
      user: new User(user.id, user.name)
    }
  }
}

function addParticipant (user) {
  return {
    type: 'Add-Participant',
    data: {
      user: new User(user.id, user.name)
    }
  }
}

function removeParticipant (user) {
  return {
    type: 'Remove-Participant',
    data: {
      id: user.id
    }
  }
}

function stateChangeRequest (state) {
  return {
    type: 'State-Change-Request',
    data: {
      state
    }
  }
}

function stateChange (user, state) {
  return {
    type: 'State-Change',
    data: {
      id: user.id,
      state
    }
  }
}

module.exports = {
  join,
  confirmJoin,

  addParticipant,
  removeParticipant,

  stateChangeRequest,
  stateChange
}
