import assert from 'node:assert'
import { ajv } from './ajv.mjs'
import { roomRepository } from './rooms/room.repository.mjs'
import { userRepository } from './users/user.repository.mjs'

export function requireBody () {
  return (body, _header, _context) => {
    assert(body)
  }
}

export function requireSchema (schema) {
  return (body, _header, _context) => {
    assert(ajv.validate(schema, body), 'Invalid body!')
  }
}

export function requireRoom (idExtractor) {
  return (body, header, context) => {
    const id = idExtractor(body, header, context)
    context.room = roomRepository.find(id)
    assert(context.room, `Unknown room: ${id}`)
  }
}

export function requireAuthorization () {
  return (_body, header, _context) => {
    assert(header.authorization, 'Unauthorized!')
  }
}

export function requireLogin () {
  return (_body, header, context) => {
    context.user = userRepository.find(header.authorization)
    assert(context.user, 'Unknown user!')
  }
}
