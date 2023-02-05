import { Delaunay } from 'd3-delaunay'
import { DisplayMode, Engine, GlobalCoordinates, Input, vec } from 'excalibur'
import { Connection, Point, TerrainType, RoomResponse } from '../types/types'
import Cell from './cellActor'
import { getMins } from './helpers'
import { RoomClient } from './roomClient'

export class CustomGame extends Engine {
    private cellActors: Cell[] = []
    private selectedCell?: Cell
    private dragStart?: GlobalCoordinates
    private isDragging = false
    private clientId: string = localStorage.getItem('id') as string
    private roomClient: RoomClient
    private room: RoomResponse

    constructor(room: RoomResponse, roomClient: RoomClient) {
        super({
            canvasElementId: 'legame',
            displayMode: DisplayMode.FillScreen,
            pointerScope: Input.PointerScope.Document,
        })

        this.roomClient = roomClient
        this.room = room
    }

    private generateMap(room: RoomResponse) {
        if (
            room.points == undefined ||
            room.terrainTypes == undefined ||
            room.boundary == undefined
        ) {
            throw new Error('Room is not in play')
        }

        const delaunay = Delaunay.from(room.points)
        const voronoi = delaunay.voronoi([
            ...room.boundary[0],
            ...room.boundary[1],
        ])

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
                if (this.isDragging) return

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
                        this.room.id,
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
                if (this.isDragging) return

                if (this.canSelectCell(cell)) {
                    cell.dirty = true
                    cell.isHovered = true
                }
            }

            cell.onHoverLeave = (cell: Cell) => {
                if (this.isDragging) return

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

    public onInitialize(_engine: Engine): void {
        this.generateMap(this.room)
        this.roomClient.subscribeToConnectLand((connectLand: Connection) => {
            if (this.room === undefined) return

            const landA = this.cellActors[connectLand.landA]
            const landB = this.cellActors[connectLand.landB]

            landA.connect(landB, connectLand.ownerId)
        })

        const initialCell = this.cellActors.find(
            (c) => c.ownerId === this.clientId
        )

        if (initialCell) {
            this.currentScene.camera.pos = initialCell.cellCenter
            this.currentScene.camera.zoom = 2
        }

        this.input.pointers.on('wheel', (evt) => {
            const isZoomIn = evt.deltaY > 0

            if (isZoomIn) {
                this.currentScene.camera.zoom *= 0.9
            } else {
                this.currentScene.camera.zoom *= 1.1
            }

            this.currentScene.camera.zoom = Math.min(
                3,
                Math.max(0.3, this.currentScene.camera.zoom)
            )
        })

        this.input.pointers.on('down', (evt) => {
            this.dragStart = evt.coordinates
        })

        this.input.pointers.on('up', (evt) => {
            this.dragStart = undefined
            this.isDragging = false
        })

        this.input.pointers.on('move', (evt) => {
            if (this.dragStart !== undefined) {
                const endPos = evt.coordinates
                const startToEndWorld = endPos.worldPos
                    .sub(this.dragStart.worldPos)
                    .scale(-1)
                const startToEndScreen = endPos.screenPos
                    .sub(this.dragStart.screenPos)
                    .scale(-1)

                if (startToEndScreen.size < 15 && this.isDragging === false)
                    return

                this.isDragging = true

                this.currentScene.camera.pos =
                    this.currentScene.camera.pos.add(startToEndWorld)

                return
            }
        })

        this.input
    }

    public start() {
        return super.start()
    }
}
