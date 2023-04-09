const merge = require('deepmerge')
const base = require('./webpack.config.base.js')

module.exports = merge(base, {
  mode: 'development',

  devtool: 'source-map',
  optimization: {
    minimize: false
  }
})
