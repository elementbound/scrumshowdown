const fs = require('fs')

function getVersion () {
  const packageContents = fs.readFileSync('package.json')
  const packageData = JSON.parse(packageContents)

  return packageData.version
}

const version = getVersion()

module.exports = {
  version
}
