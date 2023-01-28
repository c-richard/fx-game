import { Delaunay } from 'd3-delaunay'
import { Color, DisplayMode, Engine, Tile, vec } from 'excalibur'
import { RoomResponse } from '../types/types'
import Cell from './cellActor'
import { getMins } from './helpers'

export class CustomGame extends Engine {
    private cellActors: Cell[] = []

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

        room.points.forEach((_, i) => this.createCell(voronoi.cellPolygon(i)))
        room.players.forEach((player) =>
            player.land.forEach((land) => {
                this.cellActors[land].ownerId = player.id
            })
        )

        this.cellActors.forEach((cell) => this.add(cell))
    }

    private createCell(cell: Delaunay.Polygon) {
        const [minX, minY] = getMins(cell)
        const polygonAsVector = cell.map(([x, y]) => vec(x, y))

        const cellActor = new Cell({
            pos: vec(minX, minY),
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
