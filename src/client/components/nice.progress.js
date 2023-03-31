import Mustache from 'mustache'

const HTML_TEMPLATE = `
<div class="progress">
    <div class="progress__fill" style="width: {{ valuePercent }}%;">
      {{ valuePercent }}%
    </div>
</div>
`

export default class NiceProgress extends HTMLElement {
  constructor () {
    super()
    this._update()
  }

  get value () {
    return this.getAttribute('value')
  }

  set value (val) {
    this.setAttribute('value', val)
    this._update()
  }

  _update () {
    this.innerHTML = Mustache.render(HTML_TEMPLATE, {
      value: this.value,
      valuePercent: Math.round(this.value * 100)
    })
  }

  static define (name) {
    customElements.define(name || 'nice-progress', NiceProgress)
  }
}
