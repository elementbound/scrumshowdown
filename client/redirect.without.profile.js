import { loadUserData } from './storage/user.data'

const userData = loadUserData()

if (!userData || !userData.name) {
  // Redirect to profile if it doesn't exist
  console.error('Missing profile!')
  window.location = '/profile'
}
