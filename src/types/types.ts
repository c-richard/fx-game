export type Point = [x: number, y: number]

export type Points = Array<Point>

export type DeepPartial<T> = T extends object
    ? {
          [P in keyof T]?: DeepPartial<T[P]>
      }
    : T

export interface PlayerResponse {
    id: string
    land: number[]
}

export type TerrainType = 'PLANETS' | 'SPACE' | 'BLACK_HOLE' | 'EDGE'

export interface RoomResponse {
    id: string
    host: PlayerResponse
    points?: Point[]
    terrainTypes?: TerrainType[]
    connections: Connection[]
    stage: 'LOBBY' | 'PLAY' | 'ENDED'
    players: PlayerResponse[]
}

export interface OnJoined {
    room: RoomResponse
}

export type OnDiff = {
    room: DeepPartial<RoomResponse>
}

export type Connection = { ownerId: string; landA: number; landB: number }
