import { Socket } from 'socket.io'
import { Room } from '../models/room'
import { roomRepository } from '../models/repositories'
import { v4 as uuidv4 } from 'uuid'
import { Player } from '../models/player'
import { OnJoined } from '../../types/types'
import { roomToResponse } from '../mappers/roomToResponse'

export function onCreate(this: Socket, clientId: string) {
    const player = new Player(clientId, this.id)
    const room = new Room(uuidv4(), player)

    player.emit('diff', onJoinResponse(room))

    roomRepository.save(room)
}

function onJoinResponse(room: Room): OnJoined {
    return { room: roomToResponse(room) }
}
