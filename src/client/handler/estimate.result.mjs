import context from '../context.mjs'
import { renderEstimationResults } from '../actions.mjs'

export function estimateResultHandler ({ estimation }) {
  console.log('Received estimation', estimation)
  context.estimations.push(estimation)

  const resultHtml = renderEstimationResults(estimation.topic, estimation.estimates)

  const logItem = document.createElement('div')
  logItem.classList.add('estimation')

  const logs = document.querySelector('#logs')
  logItem.innerHTML = resultHtml
  logs.prepend(logItem)

  logs.classList.remove('hidden')
}
