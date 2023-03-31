import createError from 'http-errors'
import express, { json, urlencoded } from 'express'
import * as path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

import indexRouter from './routes/index.mjs'
import roomRouter from './routes/room.mjs'
import profileRouter from './routes/profile.mjs'

const app = express()
const dirname = [import.meta.url]
  .map(u => new URL(u))
  .map(u => u.pathname)
  .map(path.dirname)
  [0]

console.log(dirname)

// view engine setup
app.set('views', path.join(dirname, 'views'))
app.set('view engine', 'hbs')

app.use(logger('dev'))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(dirname, 'public')))

app.use('/', indexRouter)
app.use('/profile', profileRouter)
app.use('/room', roomRouter)

// WS Handlers
const handlers = [
  './handlers/join.mjs',
  './handlers/state.mjs',
  './handlers/estimate.mjs',
  './handlers/topic.mjs',
  './handlers/leave.mjs',
  './handlers/kick.mjs',
  './handlers/promote.mjs',
  './handlers/spectator.mjs'
]

Promise.all(handlers.map(h => import(h)))
  .then(hs => hs.forEach(h => h.default()))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

export default app
