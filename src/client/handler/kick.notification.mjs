export function kickNotificationHandler (reason) {
  document.querySelector('#kick-splash').classList.remove('hidden')
  document.querySelector('#kick-reason').innerHTML = reason || ''
}
