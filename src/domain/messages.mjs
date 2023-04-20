import { Message, MessageHeader } from '@elementbound/nlon'
import User from './user.mjs'

export const Types = Object.freeze({
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

  UpdateTopic: 'Update-Topic',

  KickRequest: 'Kick-Request',
  KickNotification: 'Kick-Notification',

  PromoteRequest: 'Promote-Request',
  PromoteNotification: 'Promote-Notification',

  SpectatorRequest: 'Spectator-Request',
  SpectatorChange: 'Spectator-Change'
})

export function join (user, roomId) {
  return {
    type: Types.Join,
    data: {
      roomId, user
    }
  }
}

/**
 * Create a Confirm Join message.
 * @param {User} user User
 */
export function confirmJoin (user) {
  return {
    type: Types.ConfirmJoin,
    data: {
      user: User.sanitize(user)
    }
  }
}

export function addParticipant (user) {
  return {
    type: Types.AddParticipant,
    data: {
      user: User.sanitize(user)
    }
  }
}

export function removeParticipant (user) {
  return {
    type: Types.RemoveParticipant,
    data: {
      id: user.id
    }
  }
}

export function stateChangeRequest (isReady, emote) {
  return {
    type: Types.StateChangeRequest,
    data: {
      isReady, emote
    }
  }
}

export function stateChange (user, isReady, emote) {
  return {
    type: Types.StateChange,
    data: {
      id: user.id,
      isReady,
      emote
    }
  }
}

export function estimateRequest () {
  return {
    type: Types.EstimateRequest
  }
}

export function estimateDecline () {
  return {
    type: Types.EstimateDecline
  }
}

export function estimateResponse (estimate) {
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
export function estimateResult (estimation) {
  return {
    type: Types.EstimateResult,
    data: {
      estimation
    }
  }
}

export function updateTopic (topic) {
  return {
    type: Types.UpdateTopic,
    data: {
      topic
    }
  }
}

/**
 * Create a Kick Request message
 * @param {User} user user
 */
export function kickRequest (user) {
  return {
    type: Types.KickRequest,
    data: {
      id: user.id
    }
  }
}

/**
 * Create a Kick Notification message
 * @param {string} [reason] reason
 */
export function kickNotification (reason) {
  return {
    type: Types.KickNotification,
    data: {
      reason
    }
  }
}

export function promoteRequest (user) {
  return {
    type: Types.PromoteRequest,
    data: {
      id: user.id
    }
  }
}

export function promoteNotification (user) {
  return {
    type: Types.PromoteNotification,
    data: {
      id: user.id
    }
  }
}

export function spectatorRequest (user, isSpectator) {
  return {
    type: Types.SpectatorRequest,
    data: {
      id: user.id,
      isSpectator: !!isSpectator
    }
  }
}

export function spectatorChange (user, isSpectator) {
  return {
    type: Types.SpectatorChange,
    data: {
      id: user.id,
      isSpectator: !!isSpectator
    }
  }
}

export function EstimationMessageProvider (estimation) {
  return () => new Message({
      header: new MessageHeader({
        subject: 'room/update/estimation'
      }),
      body: {
        estimation
      }
    })
}

export function PromoteMessageProvider (targetId) {
  return () => new Message({
      header: new MessageHeader({
        subject: 'room/update/promote'
      }),
      body: {
        target: targetId
      }
    })
}

export function SpectatorMessageProvider (targetId, isSpectator) {
  return () => new Message({
      header: new MessageHeader({
        subject: 'room/update/spectator'
      }),
      body: {
        target: targetId,
        isSpectator
      }
    })
}

export function StateMessageProvider (targetId, isReady, emote) {
  return () => new Message({
      header: new MessageHeader({
        subject: 'room/update/state'
      }),
      body: {
        target: targetId,
        isReady,
        emote
      }
    })
}

export function TopicMessageProvider (topic) {
  return () => new Message({
      header: new MessageHeader({
        subject: 'room/update/topic'
      }),
      body: {
        topic
      }
    })
}

export function JoinMessageProvider (user) {
  return () => new Message({
    header: new MessageHeader({
      subject: 'room/update/join'
    }),
    body: {
      user: User.sanitize(user)
    }
  })
}

export function LeaveMessageProvider (user) {
  return () => new Message({
    header: new MessageHeader({
      subject: 'room/update/leave'
    }),
    body: {
      user: User.sanitize(user)
    }
  })
}

export function KickMessageProvider () {
  return () => new Message({
    header: new MessageHeader({
      subject: 'room/update/kick'
    })
  })
}
