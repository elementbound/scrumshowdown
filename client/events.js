export const Types = Object.freeze({
  AdminKick: 'Admin-Kick',
  AdminPromote: 'Admin-Promote'
})

const subscribers = {}

function ensureType (type) {
  if (!subscribers[type]) {
    subscribers[type] = []
  }
}

export function subscribe (type, handler) {
  ensureType(type)
  subscribers[type].push(handler)
}

export function emit (type, ...data) {
  ensureType(type)
  subscribers[type].forEach(subscriber => subscriber(...data))
}
