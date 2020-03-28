'use strict';

module.exports = {
  plugins: [
    'plugins/markdown'
  ],

  source: {
    include: [
      'bin/www',
      'client',
      'data',
      'routes',
      'services',
      'app.js'
    ]
  },

  opts: {
    destination: './docs/',
    recurse: true
  }
}