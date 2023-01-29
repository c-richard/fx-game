import { Socket } from 'socket.io'
import { roomRepository } from '../models/repositories'
import { Connection } from '../../types/types'

export function onConnectLand(
    this: Socket,
    roomId: string,
    clientId: string,
    landA: number,
    landB: number
) {
    const room = roomRepository.getById(roomId)
    const player = room?.players.find((p) => p.id === clientId)

    if (room && player) {
        player.socketId = this.id

        // TODO check connection is valid
        room.addConnection(player, landA, landB)

        roomRepository.save(room)

        room.players.forEach((p) => {
            p.emit(
                'land-connected',
                onConnectLandResponse(clientId, landA, landB)
            )
        })
    }
}

function onConnectLandResponse(
    ownerId: string,
    landA: number,
    landB: number
): Connection {
    return {
        ownerId,
        landA,
        landB,
    }
}
