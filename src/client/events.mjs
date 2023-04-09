import * as events from 'node:events'

export const Types = Object.freeze({
  AdminKick: 'Admin-Kick',
  AdminPromote: 'Admin-Promote',
  AdminSpectatorToggle: 'Admin-Spectator-Toggle'
})

export const Source = new events.EventEmitter()
