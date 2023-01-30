import { Delaunay } from 'd3-delaunay'
import { Color, DisplayMode, Engine, Tile, vec } from 'excalibur'
import { Connection, Point, TerrainType, RoomResponse } from '../types/types'
import Cell from './cellActor'
import { getMins } from './helpers'
import { RoomClient } from './roomClient'

export class CustomGame extends Engine {
    private cellActors: Cell[] = []
    private selectedCell?: Cell
    private clientId: string = localStorage.getItem('id') as string
    private roomClient: RoomClient
    private roomId: string

    constructor(room: RoomResponse, roomClient: RoomClient) {
        super({
            canvasElementId: 'legame',
            width: 1000,
            height: 1000,
            displayMode: DisplayMode.FitScreen,
        })

        this.roomClient = roomClient
        this.roomId = room.id
        this.generateMap(room)
        this.roomClient.subscribeToConnectLand((connectLand: Connection) => {
            if (room === undefined) return

            const landA = this.cellActors[connectLand.landA]
            const landB = this.cellActors[connectLand.landB]

            landA.connect(landB, connectLand.ownerId)
        })
    }

    private generateMap(room: RoomResponse) {
        const delaunay = Delaunay.from(room.points)
        const voronoi = delaunay.voronoi([0, 0, 1000, 1000])

        // Create cells
        room.points.forEach((point, i) =>
            this.createCell(
                i,
                point,
                room.terrainTypes[i],
                voronoi.cellPolygon(i)
            )
        )

        // Assign ownership
        room.players.forEach((player) => {
            player.land.forEach((cellId) => {
                this.cellActors[cellId].ownerId = player.id
            })
        })

        // Connect neighbours
        room.points.forEach((_, cellId) => {
            for (const neighbourCellId of voronoi.neighbors(cellId)) {
                this.cellActors[cellId].addNeighbour(
                    this.cellActors[neighbourCellId]
                )
            }
        })

        // Setup cell selection
        this.cellActors.forEach((cell) => {
            cell.onSelected = (cell: Cell) => {
                if (this.canSelectCell(cell) === false) {
                    return
                }

                // Mark previous cell as changed
                this.selectedCell?.neighbours.forEach((neighbour) => {
                    if (this.canSelectCell(neighbour)) {
                        neighbour.dirty = true
                        neighbour.isSelectable = false
                    }
                })

                // None selected -> Select
                if (this.selectedCell === undefined) {
                    cell.isSelected = true
                    this.selectedCell = cell
                }

                if (
                    this.selectedCell.ownerId &&
                    this.selectedCell?.hasNeighbour((c) => c === cell)
                ) {
                    // One selected -> Cell is neighbour to first -> Select
                    this.selectedCell.connect(cell, this.selectedCell.ownerId)
                    this.roomClient.connectLand(
                        this.roomId,
                        this.clientId,
                        this.selectedCell.landId,
                        cell.landId
                    )
                    this.selectedCell.dirty = true
                    this.selectedCell.isSelected = false
                    this.selectedCell = undefined
                } else {
                    // One selected -> Cell is not neighbour to first -> Select
                    this.selectedCell.isSelected = false
                    cell.isSelected = true
                    this.selectedCell = cell
                }

                // Mark new cell as changed
                if (this.selectedCell) {
                    cell.dirty = true

                    this.selectedCell.neighbours.forEach((neighbour) => {
                        if (this.canSelectCell(neighbour)) {
                            neighbour.isSelectable = true
                            neighbour.dirty = true
                        }
                    })
                }
            }

            cell.onHoverEnter = (cell: Cell) => {
                if (this.canSelectCell(cell)) {
                    cell.dirty = true
                    cell.isHovered = true
                }
            }

            cell.onHoverLeave = (cell: Cell) => {
                if (cell.isHovered === true) {
                    cell.dirty = true
                    cell.isHovered = false
                }
            }
        })

        // Setup existing connections
        room.connections.forEach(
            ({ ownerId, landA: landAId, landB: landBId }) => {
                const landA = this.cellActors[landAId]
                const landB = this.cellActors[landBId]

                landA.connect(landB, ownerId)
            }
        )

        this.cellActors.forEach((cell) => this.add(cell))
    }

    private canSelectCell(cell: Cell) {
        if (this.selectedCell === undefined) {
            return (
                cell.ownerId === this.clientId &&
                cell.neighbours.length !== cell.connections.length
            )
        }

        const isNeighbourToSelected = cell.hasNeighbour(
            (n) => n.ownerId === this.selectedCell?.ownerId
        )
        const hasNoExistingConnection =
            cell.hasConnection((c) => c === this.selectedCell) === false

        return isNeighbourToSelected && hasNoExistingConnection
    }

    private createCell(
        landId: number,
        [x, y]: Point,
        type: TerrainType,
        cell: Delaunay.Polygon
    ) {
        const [minX, minY] = getMins(cell)
        const polygonAsVector = cell.map(([x, y]) => vec(x, y))

        const cellActor = new Cell({
            landId,
            pos: vec(minX, minY),
            cellCenter: vec(x, y),
            polygon: polygonAsVector,
            ownerId: null,
            type,
        })

        this.cellActors.push(cellActor)
    }

    public start() {
        return super.start()
    }
}
