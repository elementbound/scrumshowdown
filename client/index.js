import { addHand, render } from './render'

// https://jimpix.co.uk/words/random-username-generator.asp#results
const usernames = [
  'sixthchoat',
  'sledattire',
  'underpaywikipedia',
  'ballsnuffim',
  'robecrushing',
  'harmlessbuyer',
  'priscillanemo',
  'wikipediacork',
  'whimpergneeth',
  'flatfoothandlers',
  'sniffcrier',
  'twistedplaymate',
  'abcpetri'
]

async function main () {
  await render()

  const userId = document.querySelector('.data.user-id').innerHTML
  const userName = document.querySelector('.data.user-name').innerHTML
  const roomId = document.querySelector('.data.room-id').innerHTML

  console.log({
    userId,
    userName,
    roomId
  })

  usernames.forEach(username => {
    addHand({ name: username })
  })
}

main()
