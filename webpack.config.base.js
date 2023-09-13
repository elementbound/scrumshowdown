const path = require('path')
const webpack = require('webpack')
const merge = require('deepmerge')

const publicDir = path.resolve(__dirname, 'public')
const distDir = path.resolve(publicDir, 'bundles')

const config = {
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
  },

  resolve: {
    fallback: {
      assert: require.resolve('assert-browserify'),
      events: require.resolve('events'),
      os: require.resolve('os-browserify'),
      stream: require.resolve('stream-browserify'),
      process: require.resolve('process')
    }
  }
}

const plugins = [
  // Handle 'node:*' imports by replacing them with their regular counterparts
  // which can be polyfilled
  new webpack.NormalModuleReplacementPlugin(/^node:/, resource => {
    resource.request = resource.request.replace(/^node:/, '')
  }),

  new webpack.ProvidePlugin({
    process: 'process'
  })
]

module.exports = {
  configure: overrides => {
    return Object.assign({}, merge(config, overrides), { plugins })
  }
}
