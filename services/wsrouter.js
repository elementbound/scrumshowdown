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
    rawSend.apply(ws, [JSON.stringify(data)])
  }
  return ws
}

function _pushHandler (type, handler) {
  handlers[type].push(handler)
}

function _callHandlers (type, ...args) {
  handlers[type].forEach(handler => handler(...args))
}

function callConnect (ws) {
  ws = _withJSONSend(ws)
  _callHandlers('connect', ws)
}

function callOpen (ws) {
  _callHandlers('open', ws)
}

function callMessage (ws, data) {
  _callHandlers('message', ws, JSON.parse(data))
}

function callClose (ws, code, reason) {
  _callHandlers('close', ws, code, reason)
}

function onConnect (handler) {
  _pushHandler('connect', handler)
}

function onOpen (handler) {
  _pushHandler('open', handler)
}

function onMessage (handler) {
  _pushHandler('message', handler)
}

function onClose (handler) {
  _pushHandler('close', handler)
}

/**
 * Get or set WS Server
 * @param {ws.Server} value WS Server
 * @returns {ws.Server} server
 */
function server (value) {
  if (value) {
    wsServer = value
  }

  return wsServer
}

function broadcast (data) {
  wsServer.clients.forEach(ws => ws.send(data))
}

module.exports = {
  callConnect,
  callOpen,
  callMessage,
  callClose,

  onConnect,
  onOpen,
  onMessage,
  onClose,

  server,
  broadcast
}
