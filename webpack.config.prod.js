const merge = require('deepmerge')
const base = require('./webpack.config.base.js')

module.exports = merge(base, {
  mode: 'production'
})
