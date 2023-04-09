const base = require('./webpack.config.base.js')

module.exports = base.configure({
  mode: 'development',

  devtool: 'source-map',
  optimization: {
    minimize: false
  }
})
