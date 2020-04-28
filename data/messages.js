const User = require('./user')

const Types = Object.freeze({
  Join: 'Join',
  ConfirmJoin: 'Confirm-Join',

  AddParticipant: 'Add-Participant',
  RemoveParticipant: 'Remove-Participant',

  StateChangeRequest: 'State-Change-Request',
  StateChange: 'State-Change',

  EstimateRequest: 'Estimate-Request',
  EstimateDecline: 'Estimate-Decline',
  EstimateResponse: 'Estimate-Response',
  EstimateResult: 'Estimate-Result',

  UpdateTopic: 'Update-Topic'
})

function join (username, roomId) {
  return {
    type: Types.Join,
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
    type: Types.ConfirmJoin,
    data: {
      user: User.sanitize(user)
    }
  }
}

function addParticipant (user) {
  return {
    type: Types.AddParticipant,
    data: {
      user: User.sanitize(user)
    }
  }
}

function removeParticipant (user) {
  return {
    type: Types.RemoveParticipant,
    data: {
      id: user.id
    }
  }
}

function stateChangeRequest (isReady, emote) {
  return {
    type: Types.StateChangeRequest,
    data: {
      isReady, emote
    }
  }
}

function stateChange (user, isReady, emote) {
  return {
    type: Types.StateChange,
    data: {
      id: user.id,
      isReady,
      emote
    }
  }
}

function estimateRequest () {
  return {
    type: Types.EstimateRequest
  }
}

function estimateDecline () {
  return {
    type: Types.EstimateDecline
  }
}

function estimateResponse (estimate) {
  return {
    type: Types.EstimateResponse,
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
    type: Types.EstimateResult,
    data: {
      estimation
    }
  }
}

function updateTopic (topic) {
  return {
    type: Types.UpdateTopic,
    data: {
      topic
    }
  }
}

module.exports = {
  Types,

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
