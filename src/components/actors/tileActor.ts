import { Actor, Color, Engine, Vector } from 'excalibur'
import { TileType } from '../../types/types'

class Tile extends Actor {
  public ownerId: string | null = null
  public type: TileType = 'UNKNOWN'
  public isSelected: boolean = false

  constructor(p: {
    pos: Vector
    color: Color
    radius: number
    ownerId: string | null
    type: TileType
  }) {
    const { ownerId, type, ...res } = p
    super(res)
    this.ownerId = ownerId
    this.type = type
  }

  onInitialize(engine: Engine): void {
    engine.on('pointerdown', () => console.log(this.pos))
  }
}

export default Tile
