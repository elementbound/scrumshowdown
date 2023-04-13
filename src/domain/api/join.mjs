import { Message, MessageHeader } from '@elementbound/nlon'

export const JoinSubject = 'room/join'

export function JoinRequestMessage (user, roomId) {
  return new Message({
    header: new MessageHeader({
      subject: JoinSubject
    }),

    body: {
      roomId,
      user
    }
  })
}
