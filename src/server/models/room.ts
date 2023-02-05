import { Connection } from '../../types/types.js'
import { GameMap } from './map.js'
import { Player } from './player.js'

export class Room {
    id: string
    host: Player
    players: Player[] = []
    stage: 'LOBBY' | 'PLAY' = 'LOBBY'
    map?: GameMap
    connections: Connection[] = []

    constructor(id: string, host: Player) {
        this.id = id
        this.host = host
        this.addPlayer(host)
    }

    addPlayer(player: Player) {
        if (this.players.find((p) => p.id === player.id) === undefined) {
            this.players.push(player)
        }
    }

    removePlayer(player: Player) {
        this.players = this.players.filter((p) => p.id !== player.id)
    }

    addConnection(player: Player, landA: number, landB: number) {
        if (this.map) {
            this.map.addLandToPlayer(landB, player.id)
            this.connections.push({
                ownerId: player.id,
                landA,
                landB,
            })
        }
    }

    startGame() {
        this.stage = 'PLAY'
        this.map = new GameMap({
            size: 256,
        })
        this.players.forEach((p) => {
            this.map?.assignRandomLand(p)
        })
    }
}
