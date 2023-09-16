import assert from 'node:assert'
import { getLogger } from '../../logger.mjs'
import context from '../context.mjs'

const logger = getLogger({ name: 'promoteNotificationHandler' })

export function promoteNotificationHandler (id) {
  const user = context.findParticipant(id)
  assert(user, `Trying to promote unknown user: ${id}`)
  logger.info({ user: id }, 'Promoting user to admin')

  user.isAdmin = true
  user.hand.isAdmin = true;

  [...document.querySelectorAll('user-admin')]
    .flatMap(userAdmin => userAdmin.userEntries)
    .forEach(({ item }) => { item.isAdmin = true })
}
