import assert from 'node:assert'
import { ajv } from './ajv.mjs'
import { roomRepository } from './rooms/room.repository.mjs'

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
