import { range } from 'rambda'
import { Player } from './player'

const generateNumber = (min: number, max: number) =>
    Math.min(max, Math.max(min, Math.random() * 1000))

const generatePoint = (min: number, max: number) =>
    [generateNumber(min, max), generateNumber(min, max)] as const

export class Room {
    id: string
    players: Record<string, Player> = {}
    points = range(1, 64).map(() => generatePoint(0, 1000))
    freeLand = range(0, 64 - 1)

    constructor(id: string) {
        this.id = id
    }

    addPlayer(playerId: string) {
        const player = new Player(playerId)

        const randomFreeLand = this.freeLand.splice(
            Math.floor(Math.random() * 64),
            1
        )

        player.addLand(randomFreeLand)

        this.players[playerId] = player
    }
}
