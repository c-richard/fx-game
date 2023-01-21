export type Point = [x: number, y: number]

export type Points = Array<Point>

export interface Player {
    id: string
    land: number[]
}

export interface Room {
    id: string
    points: Point[]
    players: Record<string, Player>
}
