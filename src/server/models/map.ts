import { range } from 'rambda'
import { Point, TerrainType } from '../../types/types'
import { Player } from './player'
import * as test from 'd3-delaunay'

const a = test.Delaunay.from([[0, 1]])

const generateNumber = (min: number, max: number) =>
    Math.floor(Math.min(max, Math.max(min, Math.random() * 1000)))

const generatePoint = (min: number, max: number) =>
    [generateNumber(min, max), generateNumber(min, max)] as Point

const generateType = (): TerrainType => {
    if (Math.random() <= 0.3) {
        return 'PLANETS' as const
    }

    if (Math.random() <= 0.9) {
        return 'SPACE' as const
    }

    return 'BLACK_HOLE' as const
}

export class GameMap {
    points: Point[]
    freeLand: number[]
    playerToLandIds: Partial<Record<string, number[]>> = {}
    landToPlayerId: Partial<Record<number, string>> = {}
    terrainTypes: TerrainType[] = []

    constructor(size: number) {
        this.points = range(1, size).map(() => generatePoint(0, 1000))
        this.terrainTypes = range(1, size).map(() => generateType())
        this.freeLand = range(0, size - 1)

        this.points.forEach(([x, y], i) => {
            if (x < 100 || y < 100 || x > 900 || y > 900) {
                this.terrainTypes[i] = 'EDGE'
            }
        })
    }

    assignRandomLand(player: Player) {
        let landId: number | null = null

        while (landId === null) {
            landId = Math.floor(Math.random() * this.freeLand.length)
            if (this.terrainTypes[landId] === 'EDGE') {
                landId = null
            }
        }

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
