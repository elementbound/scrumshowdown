import { createServer } from 'http'
import * as ws from 'ws'
import app from './app.mjs'
import { config } from './config.mjs'
import * as wsr from '../wsrouter.mjs'
import { rootLogger } from '../logger.mjs'

// Start HTTP server
const appServer = createServer(app)
appServer.listen(config.http.port, config.http.host)
appServer.on('listening', () =>
  rootLogger().info(
    'HTTP server listening on %s:%d',
    config.http.host, config.http.port
  )
)

appServer.on('error', err => { throw err })

// Start WS server
const wsServer = new ws.WebSocketServer({ server: appServer })
wsServer.on('listening', () =>
  rootLogger().info('WS server listening')
)

app.locals.ws = wsServer
wsServer.on('connection', ws => {
  wsr.callConnect(ws)

  ws.on('open', () => wsr.callOpen(ws))
  ws.on('close', (code, reason) => wsr.callClose(ws, code, reason))
  ws.on('message', data => wsr.callMessage(ws, data))
})

wsr.server(wsServer)
