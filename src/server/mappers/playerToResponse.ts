import { PlayerResponse } from '../../types/types.js'
import { GameMap } from '../models/map.js'
import { Player } from '../models/player.js'

export function playerToResponse(
    player: Player,
    map?: GameMap
): PlayerResponse {
    return {
        id: player.id,
        land: map?.getPlayerLands(player.id) || [],
    }
}
