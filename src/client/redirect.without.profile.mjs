import { loadUserData } from './storage/user.data.mjs'

const userData = loadUserData()

if (!userData || !userData.name) {
  // Redirect to profile if it doesn't exist
  console.error('Missing profile!')
  window.location = '/profile'
}
