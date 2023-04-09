const path = require('path')

const publicDir = path.resolve(__dirname, 'public')
const distDir = path.resolve(publicDir, 'bundles')

module.exports = {
  entry: {
    main: './src/client/index.mjs',
    profile: './src/client/profile.mjs',
    'redirect.without.profile': './src/client/redirect.without.profile.mjs'
  },

  output: {
    filename: '[name].js',
    path: distDir
  },

  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
}
