import context from '../context.mjs'
import * as messages from '../../domain/messages.mjs'

export function estimateRequestHandler () {
  const estimate = document.querySelector('[name=estimate]').value

  const { user } = context
  console.log('Responding with estimate', estimate)
  user.websocket.send(messages.estimateResponse(estimate))
}
