import { range } from 'rambda'
import { Player } from './player'

const generateNumber = (min: number, max: number) =>
    Math.min(max, Math.max(min, Math.random() * 1000))

const generatePoint = (min: number, max: number) =>
    [generateNumber(min, max), generateNumber(min, max)] as const

export class Room {
    id: string
    winner?: Player
    players: Record<string, Player> = {}
    points = range(1, 64).map(() => generatePoint(0, 1000))
    freeLand = range(0, 63)
    landToPlayer: Partial<Record<number, Player>> = {}

    constructor(id: string) {
        this.id = id
    }

    addPlayer(playerId: string) {
        const player = new Player(playerId)

        this.transferLand(
            Math.floor(Math.random() * this.freeLand.length),
            player
        )

        this.players[playerId] = player
    }

    transferLand(landId: number, player: Player) {
        const candidateLand = this.landToPlayer[landId]

        if (candidateLand == undefined) {
            this.landToPlayer[landId] = player
            this.freeLand.splice(landId, 1)
            player.addLand(landId)
        } else {
            player.removeLand(landId)
            this.landToPlayer[landId] = player
            player.addLand(landId)
        }

        this.checkWinCondition()
    }

    checkWinCondition() {
        const playersWithLand = Object.values(this.players).filter((p) =>
            p.hasLand()
        )

        if (playersWithLand.length === 1) {
            this.winner = playersWithLand[0]
        }
    }
}
