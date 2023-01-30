import { Socket } from 'socket.io'
import { roomRepository } from '../models/repositories'
import { Player } from '../models/player'
import { OnDiff } from '../../types/types'
import { playerToResponse } from '../mappers/playerToResponse'
import { Room } from '../models/room'

export function onBegin(this: Socket, roomId: string, clientId: string) {
    const player = new Player(clientId, this.id)
    const room = roomRepository.getById(roomId)

    if (room && room.host.id === player.id) {
        room.startGame()

        roomRepository.save(room)

        room.players.forEach((p) => {
            p.emit('diff', onBeginResponse(room))
        })
    }
}

function onBeginResponse(room: Room): OnDiff {
    return {
        room: {
            stage: 'PLAY',
            points: room.map?.points,
            terrainTypes: room.map?.terrainTypes,
            host: playerToResponse(room.host, room?.map),
            players: room.players.map((p) => playerToResponse(p, room?.map)),
        },
    }
}
