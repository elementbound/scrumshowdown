const path = require('path')

const distDir = path.resolve(__dirname, 'dist')
const publicDir = path.resolve(__dirname, 'public')

module.exports = {
  entry: {
    main: './src/index.js'
  },

  devtool: 'source-map',
  optimization: {
    minimize: false
  },

  devServer: {
    contentBase: publicDir
  },

  output: {
    filename: '[name].js',
    path: distDir
  },

  module: {
    rules: [
      {
        test: /\.(fs|vs)$/,
        use: 'raw-loader'
      },

      {
        test: /\.worker\.js$/,
        use: 'worker-loader'
      }
    ]
  }
}
