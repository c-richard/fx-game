import {
    Actor,
    Color,
    Engine,
    Line,
    Polygon,
    PolygonCollider,
    Vector,
} from 'excalibur'
import { TerrainType } from '../types/types'

class Cell extends Actor {
    public landId: number
    public ownerId: string | null = null
    public type: TerrainType
    public isSelected: boolean = false
    public isHovered: boolean = false
    public isSelectable: boolean = false

    cellColor: Color = Color.DarkGray
    polygon: Vector[] = []
    neighbours: Cell[] = []
    connections: Cell[] = []
    cellCenter: Vector
    dirty: boolean = true

    onSelected: (cell: Cell) => void = () => {}
    onHoverEnter: (cell: Cell) => void = () => {}
    onHoverLeave: (cell: Cell) => void = () => {}

    constructor({
        landId,
        pos,
        cellCenter,
        polygon,
        ownerId,
        type,
        ...res
    }: {
        landId: number
        pos: Vector
        cellCenter: Vector
        polygon: Vector[]
        ownerId: string | null
        type: TerrainType
    }) {
        super({
            ...res,
            pos,
            collider: new PolygonCollider({
                points: polygon,
                offset: pos.negate(),
            }),
        })

        this.landId = landId
        this.cellCenter = cellCenter
        this.polygon = polygon
        this.ownerId = ownerId
        this.type = type
    }

    onInitialize(): void {
        this.on('pointerup', () => {
            this.onSelected(this)
        })

        this.on('pointerenter', () => {
            this.onHoverEnter(this)
        })

        this.on('pointerleave', () => {
            this.onHoverLeave(this)
        })

        this.anchor = Vector.Zero

        this.cellColor =
            this.type === 'BLACK_HOLE'
                ? Color.Black
                : this.type === 'PLANETS'
                ? Color.Orange
                : Color.Green

        this.graphics.show(
            new Polygon({
                points: this.polygon,
                color: this.cellColor,
            })
        )

        const polygonAtTopLeft = this.polygon.map((p) => p.sub(this.pos))

        polygonAtTopLeft.forEach((a, i) => {
            const b = polygonAtTopLeft[(i + 1) % this.polygon.length]
            const lineyLine = new Line({
                start: a,
                end: b,
                color: Color.Vermilion,
                thickness: 3,
            })

            this.graphics.show(lineyLine)
        })
    }

    connect(neighbour: Cell, ownerId: string) {
        this.ownerId = ownerId
        this.dirty = true

        neighbour.ownerId = ownerId
        neighbour.dirty = true

        this.connections.push(neighbour)
        neighbour.connections.push(this)
    }

    onPostUpdate(_engine: Engine, _delta: number): void {
        if (this.dirty === false) return

        if (this.ownerId) this.cellColor = Color.Red
        if (this.isSelected) this.color = this.cellColor.darken(0.5)
        else if (this.isHovered) this.color = this.cellColor.lighten(0.75)
        else if (this.isSelectable) this.color = this.cellColor.darken(0.25)
        else this.color = this.cellColor

        this.connections.forEach((connection) => {
            const lineyLine = new Line({
                start: this.cellCenter.sub(this.pos),
                end: connection.cellCenter.sub(this.pos),
                color: Color.Orange,
                thickness: 3,
            })
            this.graphics.show(lineyLine)
        })

        this.dirty = false
    }

    addNeighbour(neighbour: Cell) {
        this.neighbours.push(neighbour)
    }

    hasNeighbour(filter: (cell: Cell) => boolean) {
        return this.neighbours.find(filter) !== undefined
    }

    hasConnection(filter: (cell: Cell) => boolean) {
        return this.connections.find(filter) !== undefined
    }
}

export default Cell
