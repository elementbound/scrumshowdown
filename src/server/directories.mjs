import { dirname, resolve } from 'path'

const current = [import.meta.url]
  .map(u => new URL(u))
  .map(u => u.pathname)
  .map(dirname)
  [0]

const sourceRoot = resolve(current, '..')
const projectRoot = resolve(current, '..', '..')

const viewsDir = resolve(sourceRoot, 'server', 'views')
const publicDir = resolve(projectRoot, 'public')

export function getViewDir () {
  return viewsDir
}

export function getPublicDir () {
  return publicDir
}
