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

function sample (...values) {
  const index = Math.floor(Math.random() * values.length)
  return values[index]
}

render()

document.querySelector('.action.add-hand')
  .onclick = () => addHand({
    name: sample(...usernames)
  })

setTimeout(function addNewHand () {
  addHand({ name: usernames[0] })
  usernames.shift()

  if (usernames.length) {
    setTimeout(addNewHand, 200)
  }
}, 300)