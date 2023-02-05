import { clamp, range } from 'rambda'
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
    boundary: [Point, Point]
    playerToLandIds: Partial<Record<string, number[]>> = {}
    landToPlayerId: Partial<Record<number, string>> = {}
    terrainTypes: TerrainType[] = []
    size: number

    constructor(size: number) {
        this.size = size
        this.points = this.generatePoints()
        this.boundary = this.getBoundary()
        this.terrainTypes = this.getTerrainTypes()
        this.freeLand = range(0, this.points.length - 1)

        // TODO make sure map is traversible
    }

    getTerrainTypes() {
        const [[minX, minY], [maxX, maxY]] = this.boundary
        const terrain = range(1, this.points.length).map(generateType)
        const voronoi = Delaunay.from(this.points).voronoi([
            minX,
            minY,
            maxX,
            maxY,
        ])

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

    getBoundary(): [Point, Point] {
        const minX = Math.min(...this.points.map(([x, _]) => x))
        const minY = Math.min(...this.points.map(([_, y]) => y))
        const maxX = Math.max(...this.points.map(([x, _]) => x))
        const maxY = Math.max(...this.points.map(([_, y]) => y))

        const min: Point = [minX, minY]
        const max: Point = [maxX, maxY]

        return [min, max]
    }

    generatePoints() {
        let cells = range(0, this.size).map(() => ({
            pos: [Math.random() * 2 - 1, Math.random() * 2 - 1] as Point,
            radius: clamp(0.1, 1, Math.random()),
        }))

        let collisionCount = 0

        do {
            collisionCount = 0
            const delaunay = Delaunay.from(cells.map((c) => c.pos))

            cells = cells.map(({ pos: [x, y], radius }, i) => {
                const vNeighbourToPoint = [...delaunay.neighbors(i)]
                    .map((neighbourIndex) => cells[neighbourIndex].pos)
                    .map(([nx, ny]) => [-nx + x, -ny + y])
                    .filter(([nx, ny]) => Math.abs(nx) + Math.abs(ny) < radius)

                if (vNeighbourToPoint.length === 0) {
                    return { pos: [x, y], radius }
                } else {
                    collisionCount += vNeighbourToPoint.length

                    const [sumX, sumY] = vNeighbourToPoint.reduce(
                        ([ax, ay], [dx, dy]) => [ax + dx, ay + dy],
                        [0, 0]
                    )

                    const [rx, ry] = [
                        (Math.random() * 2 - 1) * 0.1,
                        (Math.random() * 2 - 1) * 0.1,
                    ]

                    const [ax, ay] = [
                        sumX / vNeighbourToPoint.length,
                        sumY / vNeighbourToPoint.length,
                    ]

                    return { pos: [x + ax + rx, y + ay + ry], radius }
                }
            })
        } while (collisionCount > 0)

        return cells.map(
            ({ pos: [x, y] }) =>
                [Math.round(x * 125), Math.round(y * 125)] as Point
        )
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
