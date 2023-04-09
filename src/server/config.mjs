import * as dotenv from 'dotenv'
import { getLogger } from '../logger.mjs'

/**
  * Parse config value as integer.
  *
  * @param {any} value Value
  * @returns {number?} Integer or undefined
  */
function integer (value) {
  const result = parseInt(value)
  return isNaN(result) ? undefined : result
}

dotenv.config()

export const config = Object.freeze({
  http: {
    host: process.env.SCRUM_HTTP_HOST ?? '::1',
    port: integer(process.env.SCRUM_HTTP_PORT) ?? 80
  },

  ws: {
    ping: {
      interval: integer(process.env.SCRUM_WS_PING_INTERVAL) ?? 3000
    }
  },

  id: {
    length: {
      room: integer(process.env.SCRUM_ID_LENGTH_ROOM) ?? 8,
      user: integer(process.env.SCRUM_ID_LENGTH_USER) ?? 21
    },

    attempts: integer(process.env.SCRUM_ID_ATTEMPTS) ?? 8192
  }
})

getLogger({ name: 'config' }).info({ config }, 'Loaded configuration')
