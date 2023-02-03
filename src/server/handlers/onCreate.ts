import { Socket } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'

import { Room } from '../models/room.js'
import { roomRepository } from '../models/repositories.js'
import { Player } from '../models/player.js'
import { OnJoined } from '../../types/types.js'
import { roomToResponse } from '../mappers/roomToResponse.js'

export function onCreate(this: Socket, clientId: string) {
    const player = new Player(clientId, this.id)
    const room = new Room(uuidv4(), player)

    player.emit('diff', onJoinResponse(room))

    roomRepository.save(room)
}

function onJoinResponse(room: Room): OnJoined {
    return { room: roomToResponse(room) }
}
