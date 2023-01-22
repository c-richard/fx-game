import { Actor, Color, Vector } from 'excalibur'
import { TileType } from '../../types/types'

class Tile extends Actor {
  public ownerId: string | null = null
  public type: TileType = 'UNKNOWN'

  constructor(p: {
    pos: Vector
    color: Color
    ownerId: string | null
    type: TileType
  }) {
    const { ownerId, type, ...res } = p
    super(res)
    this.ownerId = ownerId
    this.type = type
  }
}

export default Tile
