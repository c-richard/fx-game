import { Delaunay } from 'd3-delaunay'
import { DisplayMode, Engine, vec } from 'excalibur'
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
        if (room.points == undefined || room.terrainTypes == undefined) {
            throw new Error('Room is not in play')
        }

        const delaunay = Delaunay.from(room.points)
        const voronoi = delaunay.voronoi([0, 0, 1000, 1000])

        // Create cells
        room.points.forEach((point, i) =>
            this.createCell(
                i,
                point,
                room.terrainTypes?.[i] as TerrainType,
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

                this.resetSelectedCell()
                this.resetSelectedNeighbours()

                if (this.selectedCell === undefined) {
                    this.selectCell(cell)
                    return
                }

                // Select selected cell -> Deselect it
                if (this.selectedCell === cell) {
                    this.deselectCell()
                    return
                }

                if (this.canCreateRouteToCell(cell)) {
                    this.roomClient.connectLand(
                        this.roomId,
                        this.clientId,
                        this.selectedCell.landId,
                        cell.landId
                    )
                    this.deselectCell()
                    return
                }

                this.selectCell(cell)
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

    private deselectCell() {
        if (this.selectedCell) {
            this.selectedCell.isSelected = false
            this.selectedCell = undefined
        }
    }

    private selectCell(cell: Cell) {
        this.selectedCell = cell
        this.selectedCell.isSelected = true
        this.selectedCell.dirty = true

        this.selectedCell.neighbours.forEach((neighbour) => {
            if (this.canCreateRouteToCell(neighbour)) {
                neighbour.isSelectable = true
                neighbour.dirty = true
            }
        })
    }

    private resetSelectedCell() {
        if (this.selectedCell) {
            this.selectedCell.dirty = true
            this.selectedCell.isSelectable = false
            this.selectedCell.isSelected = false
        }
    }

    private resetSelectedNeighbours() {
        this.selectedCell?.neighbours.forEach((neighbour) => {
            neighbour.dirty = true
            neighbour.isSelectable = false
            neighbour.isSelected = false
        })
    }

    private canSelectCell(cell: Cell) {
        if (this.selectedCell === undefined || this.selectedCell === cell) {
            return (
                cell.ownerId === this.clientId &&
                cell.neighbours.filter((n) => n.type !== 'BLACK_HOLE')
                    .length !== cell.connections.length
            )
        }

        const isOwnedByPlayer = cell.ownerId === this.clientId

        const isNeighbourToSelected = cell.hasNeighbour(
            (n) => n === this.selectedCell
        )

        const hasNoExistingConnection =
            cell.hasConnection((c) => c === this.selectedCell) === false

        return (
            isOwnedByPlayer ||
            (isNeighbourToSelected &&
                hasNoExistingConnection &&
                cell.type !== 'BLACK_HOLE')
        )
    }

    private canCreateRouteToCell(cell: Cell) {
        const isNeighbourToSelected = cell.hasNeighbour(
            (n) => n === this.selectedCell
        )

        const hasNoExistingConnection =
            cell.hasConnection((c) => c === this.selectedCell) === false

        return (
            isNeighbourToSelected &&
            hasNoExistingConnection &&
            cell.type !== 'BLACK_HOLE'
        )
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
