import { GameMap } from './map'
import { Player } from './player'

export class Room {
    id: string
    host: Player
    players: Player[] = []
    stage: 'LOBBY' | 'PLAY' = 'LOBBY'
    map = new GameMap(64)

    constructor(id: string, host: Player) {
        this.id = id
        this.host = host
        this.addPlayer(host)
    }

    addPlayer(player: Player) {
        // todo only asign land when game has started
        if (this.players.find((p) => p.id === player.id) === undefined) {
            this.map.assignRandomLand(player)
            this.players.push(player)
        }
    }

    removePlayer(player: Player) {
        // todo remove land
        this.players = this.players.filter((p) => p.id !== player.id)
    }

    startGame() {
        this.stage = 'PLAY'
    }
}
