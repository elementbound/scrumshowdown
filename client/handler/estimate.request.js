import context from '../context'
import * as messages from '../../data/messages'

export function estimateRequestHandler () {
  const estimate = document.querySelector('[name=estimate]').value

  const { user } = context
  console.log('Responding with estimate', estimate)
  user.websocket.send(messages.estimateResponse(estimate))
}
