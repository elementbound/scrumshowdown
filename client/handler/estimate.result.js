import context from '../context'
import { renderEstimationResults } from '../actions'

export function estimateResultHandler ({ estimation }) {
  console.log('Received estimation', estimation)
  context.estimations.push(estimation)

  const resultHtml = renderEstimationResults(estimation.topic, estimation.estimates)

  const logItem = document.createElement('div')
  const logs = document.querySelector('#logs')
  logItem.innerHTML = resultHtml
  logs.prepend(logItem)

  logs.classList.remove('hidden')
}
