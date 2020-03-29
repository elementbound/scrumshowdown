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
 * @param {Map<string, string>} estimates A <user id; estimate> mapping
 */
function estimateResult (estimates) {
  return {
    type: 'Estimate-Result',
    data: {
      estimates
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
  estimateResult
}
