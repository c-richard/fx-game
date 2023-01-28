import { RoomResponse } from '../../types/types'
import { Room } from '../models/room'
import { playerToResponse } from './playerToResponse'

export function roomToResponse(room: Room): RoomResponse {
    return {
        id: room.id,
        points: room.map.points,
        stage: room.stage,
        host: playerToResponse(room.host, room.map),
        players: room.players.map((p) => playerToResponse(p, room.map)),
    }
}