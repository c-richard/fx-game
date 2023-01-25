import { PlayerResponse } from '../../types/types'
import { GameMap } from '../models/map'
import { Player } from '../models/player'

export function playerToResponse(player: Player, map: GameMap): PlayerResponse {
    return {
        id: player.id,
        land: map.getPlayerLands(player.id),
    }
}
