import createError from 'http-errors'
import express, { json, urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import pinoHttp from 'pino-http'

import indexRouter from './routes/index.mjs'
import roomRouter from './routes/room.mjs'
import profileRouter from './routes/profile.mjs'
import { getPublicDir, getViewDir } from './directories.mjs'

const app = express()

// view engine setup
app.set('views', getViewDir())
app.set('view engine', 'hbs')

app.use(pinoHttp())
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(getPublicDir()))

app.use('/', indexRouter)
app.use('/profile', profileRouter)
app.use('/room', roomRouter)

// NLON subjects
app.locals.subjects = [
  './subjects/join.mjs',
  './subjects/state.mjs',
  './subjects/estimate.mjs',
  './subjects/topic.mjs',
  './subjects/kick.mjs',
  './subjects/promote.mjs',
  './subjects/spectator.mjs'
]

// catch 404 and forward to error handler
app.use(function (_req, _res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, _next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

export default app
