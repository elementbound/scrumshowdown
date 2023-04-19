import { createServer } from 'http'
import * as ws from 'ws'
import app from './app.mjs'
import { config } from './config.mjs'
import { getLogger, rootLogger } from '../logger.mjs'
import { wrapWebSocketServer } from '@elementbound/nlon-websocket'

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

// Start nlon server on WS
const nlon = wrapWebSocketServer(wsServer, {
  logger: getLogger({ name: 'nlon' })
})

app.locals.nlon = nlon

// Register subjects
/** @type {string[]} */
const subjects = app.locals.subjects

Promise.all(subjects.map(subject => import(subject)))
  .then(subjects =>
    subjects
      .flatMap(mod => Object.values(mod))
      .filter(subject => subject?.name?.startsWith('handle'))
      .forEach(subject => {
        rootLogger().info('Loading subject %s', subject.name)
        subject(nlon)
      })
  )
