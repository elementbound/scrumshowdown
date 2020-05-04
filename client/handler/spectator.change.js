import context from '../context'

export function spectatorChangeHandler ({ id, isSpectator }) {
  const user = context.room.findUser(id)

  console.log('Spectator change', { id, user, isSpectator })

  user.isSpectator = isSpectator
  user.hand.isSpectator = isSpectator

  console.log('Spectator change applied', { user, context });

  [...document.querySelectorAll('user-admin')]
    .flatMap(userAdmin => userAdmin.userEntries)
    .forEach(({ user, item }) => {
      user.isSpectator = isSpectator
      item.isSpectator = isSpectator
    })
}
