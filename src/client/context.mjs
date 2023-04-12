import User from '../domain/user.mjs'
import Room from '../domain/room.mjs'

const context = {
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
