const base = require('./webpack.config.base.js')

module.exports = Object.assign({}, base, {
  mode: 'development',

  devtool: 'source-map',
  optimization: {
    minimize: false,
    splitChunks: {
      chunks: 'all'
    }
  }
})
