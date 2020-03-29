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
      user: User.sanitize(user)
    }
  }
}

function addParticipant (user) {
  return {
    type: 'Add-Participant',
    data: {
      user: User.sanitize(user)
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

function stateChangeRequest (isReady, emote) {
  return {
    type: 'State-Change-Request',
    data: {
      isReady, emote
    }
  }
}

function stateChange (user, isReady, emote) {
  return {
    type: 'State-Change',
    data: {
      id: user.id,
      isReady,
      emote
    }
  }
}

function estimateRequest () {
  return {
    type: 'Estimate-Request'
  }
}

function estimateDecline () {
  return {
    type: 'Estimate-Decline'
  }
}

function estimateResponse (estimate) {
  return {
    type: 'Estimate-Response',
    data: {
      estimate
    }
  }
}

/**
 * Create an Estimate Result message.
 * @param {Estimation} estimation
 */
function estimateResult (estimation) {
  return {
    type: 'Estimate-Result',
    data: {
      estimation
    }
  }
}

function updateTopic (topic) {
  return {
    type: 'Update-Topic',
    data: {
      topic
    }
  }
}

module.exports = {
  join,
  confirmJoin,

  addParticipant,
  removeParticipant,

  stateChangeRequest,
  stateChange,

  estimateRequest,
  estimateResponse,
  estimateDecline,
  estimateResult,

  updateTopic
}
