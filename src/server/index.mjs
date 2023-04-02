import app from './app.mjs'
import { createServer } from 'http'
import ws from 'ws'
import * as wsr from '../wsrouter.mjs'

// Start HTTP server
const port = +(process.env.PORT || 3000)
app.set('port', port)

const appServer = createServer(app)
appServer.listen(port)
appServer.on('listening', () =>
  console.log('HTTP server listening on port', port)
)

appServer.on('error', err => { throw err })

// Start WS server
const wsServer = new ws.Server({ server: appServer })
wsServer.on('listening', () =>
  console.log('WS server listening')
)

app.locals.ws = wsServer
wsServer.on('connection', ws => {
  wsr.callConnect(ws)

  ws.on('open', () => wsr.callOpen(ws))
  ws.on('close', (code, reason) => wsr.callClose(ws, code, reason))
  ws.on('message', data => wsr.callMessage(ws, data))
})

wsr.server(wsServer)
