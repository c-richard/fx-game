import {
    Actor,
    CircleCollider,
    Color,
    Engine,
    Polygon,
    PolygonCollider,
    vec,
    Vector,
} from 'excalibur'
import { mean } from 'rambda'
import { TileType } from '../../types/types'

class Tile extends Actor {
    public ownerId: string | null = null
    public type: TileType = 'UNKNOWN'
    public isSelected: boolean = false
    polygon: Vector[] = []

    constructor({
        ownerId,
        type,
        polygon,
        pos,
        ...res
    }: {
        pos: Vector
        color: Color
        // radius: number
        polygon: Vector[]
        ownerId: string | null
        type: TileType
    }) {
        const minX = Math.min(...polygon.map((p) => p.x))
        const minY = Math.min(...polygon.map((p) => p.y))
        const avgX = mean(polygon.map((p) => p.x))
        const avgY = mean(polygon.map((p) => p.y))

        const centeroonied = polygon.map((p) => p.sub(vec(avgX, avgY)))

        super({
            ...res,
            pos,
            collider: new PolygonCollider({
                points: centeroonied,
                offset: vec(avgX, avgY).sub(pos),
            }),
        })

        this.polygon = polygon

        this.ownerId = ownerId
        this.type = type
        this.enableCapturePointer = true
    }

    onInitialize(engine: Engine): void {
        this.graphics.use(
            new Polygon({
                points: this.polygon,
                color: Color.Green,
            })
        )

        this.on('pointerdown', () => {
            console.log('clicked', this.pos)
            this.isSelected = true
        })
    }
}

export default Tile
