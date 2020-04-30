const path = require('path')

const distDir = path.resolve(__dirname, 'public/bundles')
const publicDir = path.resolve(__dirname, 'public')

module.exports = {
  entry: {
    main: './client/index.js',
    profile: './client/profile.js'
  },

  devtool: 'source-map',
  optimization: {
    minimize: false,
    splitChunks: {
      chunks: 'all'
    }
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
