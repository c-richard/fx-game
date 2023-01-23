import {
  Actor,
  CollisionType,
  Color,
  Engine,
  PolygonCollider,
  Vector,
} from 'excalibur'
import { TileType } from '../../types/types'

class Tile extends Actor {
  public ownerId: string | null = null
  public type: TileType = 'UNKNOWN'
  public isSelected: boolean = false

  constructor(p: {
    pos: Vector
    color: Color
    collider: PolygonCollider
    ownerId: string | null
    type: TileType
  }) {
    const { ownerId, type, ...res } = p
    super(res)
    this.ownerId = ownerId
    this.type = type
    this.body.collisionType = CollisionType.Passive
    this.on('pointerdown', () => (this.isSelected = true))
  }

  onPostUpdate(engine: Engine, delta: number): void {
    if (this.isSelected) this.color = Color.Black
  }
}

export default Tile
