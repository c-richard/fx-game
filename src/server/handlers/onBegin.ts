import { Socket } from 'socket.io'
import { roomRepository } from '../models/repositories'
import { Player } from '../models/player'
import { OnDiff } from '../../types/types'

export function onBegin(this: Socket, roomId: string, clientId: string) {
    const player = new Player(clientId, this.id)
    const room = roomRepository.getById(roomId)

    if (room && room.host.id === player.id) {
        room.startGame()

        roomRepository.save(room)

        room.players.forEach((p) => {
            p.emit('diff', onBeginResponse())
        })
    }
}

function onBeginResponse(): OnDiff {
    return {
        room: {
            stage: 'PLAY',
        },
    }
}
