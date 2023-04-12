/* eslint-disable */
import { Room } from '../../domain/room.mjs'
/* eslint-enable */
import { Repository } from '../../repository.mjs'

/**
* Repository to track active rooms.
  * @extends {Repository<Room>}
  */
export class RoomRepository extends Repository { }

export const roomRepository = new RoomRepository()
