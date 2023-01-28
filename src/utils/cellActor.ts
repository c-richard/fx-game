import {
    Actor,
    Color,
    Engine,
    Line,
    Polygon,
    PolygonCollider,
    Vector,
} from 'excalibur'
import { CellType } from '../types/types'

class Cell extends Actor {
    public ownerId: string | null = null
    public type: CellType = 'UNKNOWN'
    public isSelected: boolean = false
    public isHovered: boolean = false
    public cellColor: Color = Color.Red
    polygon: Vector[] = []

    constructor({
        ownerId,
        type,
        polygon,
        tileColor,
        pos,
        ...res
    }: {
        pos: Vector
        tileColor: Color
        polygon: Vector[]
        ownerId: string | null
        type: CellType
    }) {
        super({
            ...res,
            pos,
            collider: new PolygonCollider({
                points: polygon,
                offset: pos.negate(),
            }),
        })

        this.polygon = polygon
        this.ownerId = ownerId
        this.type = type
        this.cellColor = tileColor
    }

    onInitialize(): void {
        this.on('pointerdown', () => {
            this.isSelected = true
        })

        this.on('pointerenter', () => {
            this.isHovered = true
        })

        this.on('pointerleave', () => {
            this.isHovered = false
        })

        this.anchor = Vector.Zero

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
                thickness: 5,
            })

            this.graphics.show(lineyLine)
        })
    }

    onPostUpdate(_engine: Engine, _delta: number): void {
        if (this.ownerId) {
            this.color = Color.Red
            return
        }
        if (this.isSelected) this.color = this.cellColor.darken(0.5)
        else if (this.isHovered) this.color = this.cellColor.lighten()
        else this.color = this.cellColor
    }
}

export default Cell
