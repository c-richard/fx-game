import {
    Actor,
    Color,
    Engine,
    Polygon,
    PolygonCollider,
    Vector,
} from 'excalibur'
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
        polygon: Vector[]
        ownerId: string | null
        type: TileType
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
