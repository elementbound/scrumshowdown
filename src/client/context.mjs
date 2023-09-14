import User from '../domain/user.mjs'
import Room from '../domain/room.mjs'
import { AppClient } from './app.client.mjs'

const context = {
  /** @type {AppClient} */
  client: undefined,

  room: new Room(undefined),
  user: new User(undefined, undefined),
  /* @type {Set<User>} */
  participants: new Set(),
  topic: '',

  emoteTimeout: undefined,
  estimations: [],

  findParticipant: id => {
    return [...context.participants].find(p => p.id === id)
  }
}

export default context
