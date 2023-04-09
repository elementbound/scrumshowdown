import context from '../context.mjs'
import * as messages from '../../domain/messages.mjs'
import { getLogger } from '../../logger.mjs'

const logger = getLogger({ name: 'estimateRequestHandler' })

export function estimateRequestHandler () {
  const estimate = document.querySelector('[name=estimate]').value

  const { user } = context
  logger.info('Responding with estimate %s', estimate)
  user.websocket.send(messages.estimateResponse(estimate))
}
