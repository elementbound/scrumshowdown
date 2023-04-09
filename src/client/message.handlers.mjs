import { getLogger } from '../logger.mjs'

const logger = getLogger({
  name: 'message handlers'
})

const handlers = {}

export function register (messageType, handler) {
  logger.debug('Registering handler for event', messageType, handler)

  if (!handlers[messageType]) {
    handlers[messageType] = []
  }

  handlers[messageType].push(handler)
}

export function invoke (messageType, ...data) {
  logger.debug('Invoking event with data', { type: messageType, data })

  if (handlers[messageType]) {
    handlers[messageType].forEach(handler => handler(...data))
  }
}
