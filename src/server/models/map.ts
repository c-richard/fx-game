import { clamp, range } from 'rambda'
import { Point, TerrainType } from '../../types/types.js'
import { Player } from './player.js'
import { Delaunay } from 'd3-delaunay'
import { polygonContains, polygonHull } from 'd3-polygon'
import { Angle, Vector2 } from '@daign/math'

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
        // TODO make limit and size proportional so cells have a default size
        const boundary = this.createBoundary()

        this.points = []

        let steps = 0
        while (this.points.length < size) {
            steps += 1
            const point = generatePoint(0, 1000)

            if (polygonContains(boundary, point)) {
                this.points.push(point)
            }
        }

        // Remove points too close together
        const delaunay = Delaunay.from(this.points)

        this.points = this.points.filter(([x, y], i) => {
            const minNeighbourDistance = Math.min(
                ...[...delaunay.neighbors(i)]
                    .map((neighbourIndex) => this.points[neighbourIndex])
                    .map(([nx, ny]) => {
                        const [vx, vy] = [-nx + x, -ny + y]
                        const size = Math.sqrt(vx * vx + vy * vy)
                        return size
                    })
            )

            return minNeighbourDistance > 5
        })

        this.terrainTypes = range(1, this.points.length).map(generateType)
        this.freeLand = range(0, this.points.length - 1)

        // Mark edge cells
        const voronoi = Delaunay.from(this.points).voronoi([0, 0, 1000, 1000])

        this.points.forEach((p, i) => {
            const cell = voronoi.cellPolygon(i)

            const polygonOnEdge = cell.find(
                (p) => polygonContains(boundary, p) === false
            )

            if (polygonOnEdge !== undefined) {
                this.terrainTypes[i] = 'EDGE'
            }
        })

        // TODO make sure map is traversable
    }

    createBoundary() {
        const verticesCount = clamp(5, 10, Math.round(Math.random() * 10))
        const angleIncrement = 360 / verticesCount

        let dy = range(0, verticesCount).map(() => Math.random())

        // Smooth
        const getVector = (i: number) => dy[(i + dy.length) % dy.length]

        dy = dy.map((_, i) => (getVector(i) + getVector(i - 1)) / 2)

        // Stretch to edge
        const maxDy = Math.max(...dy)
        const scale = 1 / maxDy
        dy = dy.map((y) => y * scale)

        const rawPoints = range(0, verticesCount).map((_, i) => {
            const center = new Vector2(500, 500)
            const rotate = new Angle()
            rotate.setDegrees(angleIncrement * i)

            return new Vector2(0, dy[i])
                .multiplyScalar(500)
                .rotate(rotate)
                .add(center)
        })

        const convertedPoints = rawPoints.map(
            (p) => [Math.round(p.x), Math.round(p.y)] as Point
        )

        return polygonHull(convertedPoints) as Point[]
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
