import User from '../data/user'
import Room from '../data/room'

const context = {
  room: new Room(undefined),
  user: new User(undefined, undefined),
  topic: '',

  emoteTimeout: undefined,
  estimations: []
}

export default context
