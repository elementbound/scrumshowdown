const handlers = {}

console.log('Module init')

export function register (messageType, handler) {
  console.debug('Registering handler for event', messageType, handler)

  if (!handlers[messageType]) {
    handlers[messageType] = []
  }

  handlers[messageType].push(handler)
}

export function invoke (messageType, ...data) {
  console.debug('Invoking event with data', { type: messageType, data })

  if (handlers[messageType]) {
    handlers[messageType].forEach(handler => handler(...data))
  }
}
