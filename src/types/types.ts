export type Point = [x: number, y: number]

export interface Player {
    id: string
    land: number[]
}

export interface Room {
    id: string
    points: Point[]
    players: Player[]
}
