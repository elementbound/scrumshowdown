module.exports = {
  plugins: [
    'plugins/markdown'
  ],

  source: {
    includePattern: '\\.mjs$',
    include: [
      'src/'
    ]
  },

  opts: {
    destination: './docs/',
    recurse: true
  }
}
