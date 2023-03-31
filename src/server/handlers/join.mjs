import { getRoom, joinRoom } from '../services/rooms'
import { onMessage } from '../services/wsrouter'
import { Types, kickNotification, confirmJoin, addParticipant, updateTopic, estimateResult } from '../data/messages'

function joinHandler () {
  onMessage((ws, message) => {
    if (message.type !== Types.Join) {
      return
    }

    const { roomId, user: requestUser } = message.data
    console.log('Join request', { roomId, requestUser })

    if (!requestUser.name) {
      console.error('Joining without username, declining')

      ws.send(kickNotification('Missing profile'))

      ws.close()
      return
    }

    const room = getRoom(roomId)
    if (!room) {
      console.error('Joining non-existing room', roomId)
      return
    }

    const user = joinRoom(room, requestUser)
    user.websocket = ws

    // First joiner is admin
    user.isAdmin = (room.findAdmins().length === 0)

    ws.room = room
    ws.user = user

    ws.send(confirmJoin(user))
    room.users
      .filter(u => u !== user)
      .forEach(u => {
        // Let the joinee know about the others
        ws.send(addParticipant(u))

        // Let the others know about the joinee
        u.websocket.send(addParticipant(user))
      })

    // Let the joinee know the current topic
    ws.send(updateTopic(room.topic))

    // Stream past estimations to the joinee
    room.estimations.forEach(estimation => ws.send(estimateResult(estimation)))

    console.log(room)
  })
}

export default joinHandler
