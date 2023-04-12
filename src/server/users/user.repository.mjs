/* eslint-disable */
import { User } from '../../domain/user.mjs'
/* eslint-enable */
import { Repository } from '../../repository.mjs'

/**
* Repository class with currently active users.
* @extends {Repository<User>}
*/
export class UserRepository extends Repository { }

export const userRepository = new UserRepository()
