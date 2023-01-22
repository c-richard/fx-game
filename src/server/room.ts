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

    addPlayer(clientId: string) {
        const playerIsAlreadyOnMap = Object.values(this.players).find(
            (p) => p.id == clientId
        )

        if (playerIsAlreadyOnMap) return null

        const newPlayer = new Player(clientId)

        const landId = Math.floor(Math.random() * this.freeLand.length)
        this.transferLand(landId, newPlayer)
        this.players[newPlayer.id] = newPlayer

        return newPlayer
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

        return { landId, playerId: player.id }
    }

    checkWinCondition() {
        const playersWithLand = Object.values(this.players).filter((p) =>
            p.hasLand()
        )

        if (playersWithLand.length === 1) {
            this.winner = playersWithLand[0]
            return { playerId: this.winner?.id }
        }

        return null
    }
}
