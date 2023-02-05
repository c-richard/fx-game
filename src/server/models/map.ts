import { mean, range, sum } from 'rambda'
import { Point, TerrainType } from '../../types/types.js'
import { Player } from './player.js'
import { Delaunay } from 'd3-delaunay'
import { polygonContains, polygonHull } from 'd3-polygon'

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
    boundary: [number, number, number, number]
    playerToLandIds: Partial<Record<string, number[]>> = {}
    landToPlayerId: Partial<Record<number, string>> = {}
    terrainTypes: TerrainType[] = []
    size: number

    constructor({
        size = 64,
        minSize = 20,
        maxSize = 200,
    }: {
        size?: number
        minSize?: number
        maxSize?: number
    }) {
        this.size = size
        this.points = this.generatePoints({
            minSize,
            maxSize,
        })
        this.boundary = this.getBoundary()
        this.terrainTypes = this.getTerrainTypes()
        this.freeLand = range(0, this.points.length - 1)

        // TODO make sure map is traversible
    }

    getTerrainTypes() {
        const [minX, minY, maxX, maxY] = this.boundary
        const terrain = range(1, this.points.length).map(generateType)
        const voronoi = Delaunay.from(this.points).voronoi(this.boundary)

        this.points.forEach((p, i) => {
            const cell = voronoi.cellPolygon(i)
            const isPolygonOnEdge =
                cell.find(
                    (p) =>
                        polygonContains(
                            [
                                [minX + 1, minY + 1],
                                [minX, maxY],
                                [maxX, maxY],
                                [maxX, minY],
                            ],
                            p
                        ) === false
                ) !== undefined

            if (isPolygonOnEdge) {
                terrain[i] = 'EDGE'
            }
        })

        return terrain
    }

    getBoundary(): [number, number, number, number] {
        const minX = Math.min(...this.points.map(([x, _]) => x))
        const minY = Math.min(...this.points.map(([_, y]) => y))
        const maxX = Math.max(...this.points.map(([x, _]) => x))
        const maxY = Math.max(...this.points.map(([_, y]) => y))

        return [minX, minY, maxX, maxY]
    }

    generatePoints({ minSize, maxSize }: { minSize: number; maxSize: number }) {
        const radiuses = range(0, this.size).map(
            () => Math.random() * (maxSize - minSize) + minSize
        )

        const expectedBoundaryDiamter = Math.sqrt(sum(radiuses))

        let points: Point[] = range(0, this.size).map((_, i) => [
            Math.random() * expectedBoundaryDiamter,
            Math.random() * expectedBoundaryDiamter,
        ])

        let collisionCount = 0

        do {
            collisionCount = 0
            const delaunay = Delaunay.from(points)

            points = points.map(([x, y], i) => {
                const vNeighbourToPoint = [...delaunay.neighbors(i)]
                    .map((neighbourIndex) => points[neighbourIndex])
                    .map(([nx, ny]) => [-nx + x, -ny + y])
                    .filter(
                        ([nx, ny]) => Math.abs(nx) + Math.abs(ny) < radiuses[i]
                    )

                if (vNeighbourToPoint.length > 0) {
                    collisionCount += vNeighbourToPoint.length

                    return [
                        x + mean(vNeighbourToPoint.map(([x, _]) => x)),
                        y + mean(vNeighbourToPoint.map(([_, y]) => y)),
                    ]
                }

                return [x, y]
            })
        } while (collisionCount > 0)

        return points
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
