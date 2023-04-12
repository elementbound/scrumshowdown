import context from '../context.mjs'

export function promoteNotificationHandler ({ id }) {
  const user = context.findParticipant(id)

  user.isAdmin = true
  user.hand.isAdmin = true;

  [...document.querySelectorAll('user-admin')]
    .flatMap(userAdmin => userAdmin.userEntries)
    .forEach(({ item }) => { item.isAdmin = true })
}
