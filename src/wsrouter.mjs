const handlers = {
  connect: [],
  open: [],
  message: [],
  close: []
}

let wsServer

function _withJSONSend (ws) {
  const rawSend = ws.send
  ws.send = function send (data) {
    return rawSend.apply(ws, [JSON.stringify(data)])
  }
  return ws
}

function _pushHandler (type, handler) {
  handlers[type].push(handler)
}

function _callHandlers (type, ...args) {
  handlers[type].forEach(handler => handler(...args))
}

export function callConnect (ws) {
  ws = _withJSONSend(ws)
  _callHandlers('connect', ws)
}

export function callOpen (ws) {
  _callHandlers('open', ws)
}

export function callMessage (ws, data) {
  _callHandlers('message', ws, JSON.parse(data))
}

export function callClose (ws, code, reason) {
  _callHandlers('close', ws, code, reason)
}

export function onConnect (handler) {
  _pushHandler('connect', handler)
}

export function onOpen (handler) {
  _pushHandler('open', handler)
}

export function onMessage (handler) {
  _pushHandler('message', handler)
}

export function onClose (handler) {
  _pushHandler('close', handler)
}

/**
 * Get or set WS Server
 * @param {ws.Server} value WS Server
 * @returns {ws.Server} server
 */
export function server (value) {
  if (value) {
    wsServer = value
  }

  return wsServer
}

export function broadcast (data) {
  wsServer.clients.forEach(ws => ws.send(data))
}
