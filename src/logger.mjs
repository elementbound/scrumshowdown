import pino from 'pino'

const root = pino({
  name: 'scrumshowdown'
})

export function rootLogger () {
  return root
}
