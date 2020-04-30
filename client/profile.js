import { UserData, saveUserData, loadUserData } from './storage/user.data'

const nameInput = document.querySelector('[name="name"]')
const colorButton = document.querySelector('#color')

function load () {
  const userData = loadUserData()

  if (userData) {
    nameInput.value = userData.name
    colorButton.style.backgroundColor = userData.color
  }
}

function bind () {
  document.querySelector('#save').onclick = () => {
    const userData = new UserData()
    userData.name = nameInput.value
    userData.color = colorButton.style.backgroundColor

    saveUserData(userData)
  }

  [...document.querySelectorAll('.action.color')].forEach(button => {
    const color = button.style.backgroundColor

    button.onclick = () => {
      colorButton.style.backgroundColor = color
      console.log('Received color', color)
    }
  })
}

load()
bind()
