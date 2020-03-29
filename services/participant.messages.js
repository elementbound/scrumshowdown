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

module.exports = {
  join,
  confirmJoin,

  addParticipant,
  removeParticipant
}
