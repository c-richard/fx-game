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
  public isHovered: boolean = false
  public tileColor: Color = Color.Red
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
    this.tileColor = tileColor

    this.graphics.use(
      new Polygon({
        points: this.polygon,
        color: tileColor,
      })
    )
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
  }

  onPostUpdate(_engine: Engine, _delta: number): void {
    if (this.isSelected) this.color = this.tileColor.darken(0.5)
    else if (this.isHovered) this.color = this.tileColor.lighten()
    else this.color = this.tileColor
  }
}

export default Tile
