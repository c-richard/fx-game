export type Point = [x: number, y: number]

export type Points = Array<Point>

export interface Player {
    id: string
    land: number[]
}

export interface Room {
    id: string
    points: Point[]
    stage: 'LOBBY' | 'PLAY' | 'ENDED'
    players: Record<string, Player>
}

export type TileType  = "PLANET" | "FOG" | "UNKNOWN";
