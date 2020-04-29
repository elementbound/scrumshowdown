import context from '../context'

/**
 * Handle a Remove Participant message.
 * @param {any} param0 Event data
 * @param {string} param0.id User id
 */
export function promoteNotificationHandler ({ id }) {
  const user = context.room.findUser(id)

  user.isAdmin = true
  user.hand.isAdmin = true;

  [...document.querySelectorAll('user-admin')]
    .flatMap(userAdmin => userAdmin.userEntries)
    .forEach(({ item }) => { item.isAdmin = true })
}
