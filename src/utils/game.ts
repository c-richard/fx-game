import { Delaunay } from 'd3-delaunay'
import { Color, DisplayMode, Engine, Tile, vec } from 'excalibur'
import { Point, RoomResponse } from '../types/types'
import Cell from './cellActor'
import { getMins } from './helpers'

export class CustomGame extends Engine {
    private cellActors: Cell[] = []
    private selectedCell?: Cell
    private clientId: string = localStorage.getItem('id') as string

    constructor(room: RoomResponse) {
        super({
            canvasElementId: 'legame',
            width: 1000,
            height: 1000,
            displayMode: DisplayMode.FitScreen,
        })

        this.generateMap(room)
    }

    private generateMap(room: RoomResponse) {
        const delaunay = Delaunay.from(room.points)
        const voronoi = delaunay.voronoi([0, 0, 1000, 1000])

        // Create cells
        room.points.forEach((point, i) =>
            this.createCell(point, voronoi.cellPolygon(i))
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

                this.selectedCell?.neighbours.forEach((neighbour) => {
                    if (this.canSelectCell(neighbour)) {
                        neighbour.dirty = true
                        neighbour.isSelectable = false
                    }
                })

                if (this.selectedCell === undefined) {
                    cell.isSelected = true
                    this.selectedCell = cell
                }

                if (this.selectedCell?.hasNeighbour((c) => c === cell)) {
                    this.selectedCell.connect(cell)
                    this.selectedCell.dirty = true
                    this.selectedCell.isSelected = false
                    this.selectedCell = undefined
                } else {
                    this.selectedCell.isSelected = false
                    cell.isSelected = true
                    this.selectedCell = cell
                }

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

    private createCell([x, y]: Point, cell: Delaunay.Polygon) {
        const [minX, minY] = getMins(cell)
        const polygonAsVector = cell.map(([x, y]) => vec(x, y))

        const cellActor = new Cell({
            pos: vec(minX, minY),
            cellCenter: vec(x, y),
            tileColor: Color.ExcaliburBlue,
            polygon: polygonAsVector,
            ownerId: null,
            type: 'UNKNOWN',
        })

        this.cellActors.push(cellActor)
    }

    public start() {
        return super.start()
    }
}
