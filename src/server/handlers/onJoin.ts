import { Socket } from 'socket.io'
import { OnDiff, OnJoined } from '../../types/types'
import { playerToResponse } from '../mappers/playerToResponse'
import { roomToResponse } from '../mappers/roomToResponse'
import { Player } from '../models/player'
import { Room } from '../models/room'
import { roomRepository } from '../models/repositories'

export function onJoin(this: Socket, roomId: string, clientId: string) {
    const player = new Player(clientId, this.id)
    const room = roomRepository.getById(roomId)

    if (room) {
        room.addPlayer(player)

        roomRepository.save(room)

        player.emit('diff', onJoinResponse(room))

        room.players.forEach((p) => {
            if (player.id !== p.id) {
                p.emit('diff', onNewPlayerResponse(room))
            }
        })
    }
}

function onJoinResponse(room: Room): OnJoined {
    return { room: roomToResponse(room) }
}

function onNewPlayerResponse(room: Room): OnDiff {
    return {
        room: {
            players: room.players.map((p) => playerToResponse(p, room.map)),
        },
    }
}
