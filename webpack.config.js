const path = require('path')

const publicDir = path.resolve(__dirname, 'src', 'server', 'public')
const distDir = path.resolve(publicDir, 'bundles')

module.exports = {
  entry: {
    main: './src/client/index.mjs',
    profile: './src/client/profile.mjs',
    'redirect.without.profile': './src/client/redirect.without.profile.mjs'
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
