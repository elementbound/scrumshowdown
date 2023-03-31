import { onMessage } from '../services/wsrouter'
import { Types, updateTopic } from '../data/messages'

function topicHandler () {
  onMessage((ws, message) => {
    if (message.type !== Types.UpdateTopic) {
      return
    }

    const room = ws.room
    const topic = message.data.topic
    console.log('Updating room topic', { room: room.id, topic })

    room.topic = topic

    room.users
      .forEach(u => u.websocket.send(updateTopic(room.topic)))
  })
}

export default topicHandler
