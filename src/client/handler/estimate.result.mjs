import context from '../context.mjs'
import { renderEstimationResults } from '../actions.mjs'
import { getLogger } from '../../logger.mjs'

const logger = getLogger({ name: 'estimateResultHandler' })

export function estimateResultHandler (estimation) {
  logger.info('Received estimation %s', estimation)
  context.estimations.push(estimation)

  const resultHtml = renderEstimationResults(estimation.topic, estimation.estimates)

  const logItem = document.createElement('div')
  logItem.classList.add('estimation')

  const logs = document.querySelector('#logs')
  logItem.innerHTML = resultHtml
  logs.prepend(logItem)

  logs.classList.remove('hidden')
}
