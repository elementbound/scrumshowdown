const localStorage = window.localStorage

export class UserData {
  constructor () {
    /**
     * @member {string} name User name
     */
    this.name = ''

    /**
     * @member {string} color User color
     */
    this.color = ''
  }
}

/**
 * Load user data from LocalStorage
 * @returns {UserData} user data
 */
export function loadUserData () {
  if (!localStorage) {
    return
  }

  if (!localStorage.getItem('User-Exists')) {
    return
  }

  const result = new UserData()
  result.name = localStorage.getItem('User-Name')
  result.color = localStorage.getItem('User-Color')

  return result
}

/**
 * Save user data to LocalStorage
 * @param {UserData} userData user data
 */
export function saveUserData (userData) {
  localStorage.setItem('User-Exists', true)

  localStorage.setItem('User-Name', userData.name)
  localStorage.setItem('User-Color', userData.color)
}
