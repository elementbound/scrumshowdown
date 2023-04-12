import Mustache from 'mustache'
import User from '../domain/user.mjs'
import * as messages from '../domain/messages.mjs'
import context from './context.mjs'
import * as render from './render.mjs'
import Hand from './objects/hand.mjs'
import { DEG2RAD } from './utils.mjs'

const RESULTS_TEMPLATE = `
  <h2>{{topic}}</h2>

  {{#summary}}
    <div class="estimation__summary">
      <button class="action small">{{estimate}}</button>
      <nice-progress value="{{percentage}}">{{count}}</nice-progress>
    </div>
  {{/summary}}

  <div class="estimation__votes">
    {{#votes}}
      <div class="estimation__vote">
        {{user.name}}
        <button class="action small">{{estimate}}</button>
      </div>
    {{/votes}}
  </div>
`

const EMOTE_DURATION = 1000

export function createHand (user) {
  const { camera, scene } = render.context
  const model = render.context.models.hand
  const hand = new Hand({
    name: user.name,
    color: user.color,
    isAdmin: user.isAdmin,
    isSpectator: user.isSpectator,
    camera,
    model,
    scene
  })
  render.context.objects.push(hand)

  return hand
}

/**
 * Send state change to host.
 * @param {User} user User
 */
export function sendStateChange (user) {
  user.websocket.send(messages.stateChangeRequest(user.isReady, user.emote))
}

export function sendEmote (emote) {
  return function () {
    const { user } = context
    const { websocket } = user

    user.emote = emote
    websocket.send(messages.stateChangeRequest(user.isReady, user.emote))

    context.emoteTimeout && clearTimeout(context.emoteTimeout)
    context.emoteTimeout = setTimeout(() => {
      user.emote = ''
      sendStateChange(user)
    }, EMOTE_DURATION)
  }
}

/**
 * Determine which hand state to display for user.
 * @param {User} user User
 */
export function getHandState (user) {
  return user.emote
    ? user.emote
    : (user.isReady ? 'ready' : 'idle')
}

/**
 * Align hands around the screen.
 *
 * @param {Hand[]} hands Hand objects
 */
export function alignHands (hands) {
  const handCount = hands.length

  const scale = Hand.calculateScale(handCount, render.context.camera)
  hands.forEach((hand, i) => hand.align(i, handCount, scale))

  return scale
}

/**
 * Update all hands.
 */
export function updateHands () {
  const hands = [...context.participants].map(user => user.hand)
  const handDistance = alignHands(hands)

  const { camera } = render.context
  camera.position.z = (2 * handDistance) / (2 * Math.tan(camera.fov / 2 * DEG2RAD))
}

export function updateTopic () {
  const topic = context.room.topic
  const topicElement = document.querySelector('#topic')
  if (!topicElement.isBeingEdited) {
    if (topic) {
      topicElement.innerText = topic
    } else {
      topicElement.innerHTML = '<i>Topic</i>'
    }
  }
}

export function renderEstimationResults (topic, estimates) {
  const votes = Object.entries(estimates)
    .map(([id, estimate]) => ({
      user: context.findParticipant(id) || new User(id, `{${id}}`),
      estimate
    }))
    .sort((a, b) => {
      const estimateCompare = b.estimate.toString().localeCompare(a.estimate)
      const nameCompare = a.user.name.localeCompare(b.user.name)

      return estimateCompare !== 0
        ? estimateCompare
        : nameCompare
    })

  const summary = Object.entries(votes
    .reduce((collector, { estimate }) => Object.assign({}, collector, {
      [estimate]: (collector[estimate] || 0) + 1 / votes.length
    }), {}))
    .map(([estimate, percentage]) => ({ estimate, percentage, count: percentage * votes.length }))
    .sort((a, b) => b.percentage - a.percentage)

  // Make sure that no percentage is lost due to rounding
  if (summary.length > 0) {
    const percents = summary
      .map(({ percentage }) => Math.round(percentage * 100))
    const percentageSum = percents
      .reduce((a, b) => a + b)

    summary[0].percentage += (100 - percentageSum) / 100
  }

  return Mustache.render(RESULTS_TEMPLATE, {
    topic, votes, summary
  })
}
