import { onMessage } from '../../wsrouter.mjs'
import { Types, updateTopic } from '../../domain/messages.mjs'
import { getLogger } from '../../logger.mjs'
import { roomService } from '../rooms/room.service.mjs'

function topicHandler () {
  onMessage((ws, message) => {
    if (message.type !== Types.UpdateTopic) {
      return
    }

    const room = ws.room
    const topic = message.data.topic
    const logger = getLogger({
      name: 'topicHandler',
      room: room?.id,
      topic
    })

    logger.info('Updating room topic')
    room.topic = topic

    logger.info('Sending topic change notification')
    roomService.broadcast(room, updateTopic(room.topic))
  })
}

export default topicHandler
