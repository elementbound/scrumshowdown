import context from '../context.mjs'
import { updateTopic } from '../actions.mjs'

export function updateTopicHandler ({ topic }) {
  context.room.topic = topic
  updateTopic()
}
