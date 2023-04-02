import User from '../domain/user.mjs'
import Room from '../domain/room.mjs'

const context = {
  room: new Room(undefined),
  user: new User(undefined, undefined),
  topic: '',

  emoteTimeout: undefined,
  estimations: []
}

export default context
