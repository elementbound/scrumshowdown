import context from '../context'
import { updateTopic } from '../actions'

export function updateTopicHandler ({ topic }) {
  context.room.topic = topic
  updateTopic()
}
