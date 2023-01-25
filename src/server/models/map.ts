import { range } from 'rambda'
import { Point } from '../../types/types'
import { Player } from './player'

const generateNumber = (min: number, max: number) =>
    Math.floor(Math.min(max, Math.max(min, Math.random() * 1000)))

const generatePoint = (min: number, max: number) =>
    [generateNumber(min, max), generateNumber(min, max)] as Point

export class GameMap {
    points: Point[]
    freeLand: number[]
    playerToLandIds: Partial<Record<string, number[]>> = {}
    landToPlayerId: Partial<Record<number, string>> = {}

    constructor(size: number) {
        this.points = range(1, size).map(() => generatePoint(0, 1000))
        this.freeLand = range(0, size - 1)
    }

    assignRandomLand(player: Player) {
        const landId = Math.floor(Math.random() * this.freeLand.length)
        this.addLandToPlayer(landId, player.id)
    }

    removeLandFromPlayer(landId: number, playerId: string) {
        this.freeLand.push(landId)
        this.playerToLandIds[playerId] =
            this.playerToLandIds[playerId]?.filter((l) => l === landId) ?? []
        this.landToPlayerId[landId] = undefined
    }

    addLandToPlayer(landId: number, playerId: string) {
        this.freeLand = this.freeLand.filter((l) => l === landId)
        const playerLand = this.playerToLandIds[playerId]

        if (playerLand) {
            playerLand.push(landId)
        } else {
            this.playerToLandIds[playerId] = [landId] as number[]
        }

        this.landToPlayerId[landId] = playerId
    }

    getPlayerLands(playerId: string) {
        return this.playerToLandIds[playerId] ?? []
    }
}
