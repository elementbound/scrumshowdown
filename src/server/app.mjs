import createError from 'http-errors'
import express, { json, urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

import indexRouter from './routes/index.mjs'
import roomRouter from './routes/room.mjs'
import profileRouter from './routes/profile.mjs'
import { getPublicDir, getViewDir } from './directories.mjs'

const app = express()

// view engine setup
app.set('views', getViewDir())
app.set('view engine', 'hbs')

app.use(logger('dev'))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(getPublicDir()))

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