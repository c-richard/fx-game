import { Socket } from 'socket.io'
import { OnDiff } from '../../types/types.js'
import { playerToResponse } from '../mappers/playerToResponse.js'
import { Room } from '../models/room.js'
import { roomRepository } from '../models/repositories.js'

export function onDisconnect(this: Socket) {
    const room = roomRepository
        .getAll()
        .find(
            (room) =>
                room.players.find((p) => p.socketId === this.id) !== undefined
        )

    const player = room?.players.find((p) => p.socketId === this.id)

    if (room && player && room.stage !== 'PLAY') {
        room.removePlayer(player)

        room.players.forEach((p) => {
            if (player.id !== p.id) {
                p.emit('diff', onNewPlayerResponse(room))
            }
        })
    }
}

function onNewPlayerResponse(room: Room): OnDiff {
    return {
        room: {
            players: room.players.map((p) => playerToResponse(p, room.map)),
        },
    }
}
