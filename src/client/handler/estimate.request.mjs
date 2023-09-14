import context from '../context.mjs'
import * as messages from '../../domain/messages.mjs'
import { getLogger } from '../../logger.mjs'

const logger = getLogger({ name: 'estimateRequestHandler' })

export function estimateRequestHandler (supplier) {
  const estimate = document.querySelector('[name=estimate]').value

  logger.info('Responding with estimate %s', estimate)
  supplier(estimate)
}
