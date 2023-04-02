import { readFileSync } from 'fs'

function getVersion () {
  const packageContents = readFileSync('package.json')
  const packageData = JSON.parse(packageContents)

  return packageData.version
}

export const version = getVersion()
