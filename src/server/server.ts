import { Server, Socket } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import { Player } from './player'
import { Room } from './room'

const rooms: Record<string, Room> = {}

const io = new Server({
    cors: {
        origin: 'http://localhost:8000',
    },
})

const playerIdToSocket: Record<string, Socket> = {}

io.on('connection', (socket) => {
    socket.on('create', (clientId: string) => {
        const room = new Room(uuidv4())
        rooms[room.id] = room

        playerIdToSocket[clientId] = socket

        const newPlayer = room.addPlayer(clientId)

        if (newPlayer) {
            notifyPlayersOfLandTransfer(room, newPlayer)
        }

        socket.emit('joined', { room })
    })

    socket.on('join', (roomId: string, clientId: string) => {
        playerIdToSocket[clientId] = socket
        const room = rooms[roomId]

        if (room) {
            const newPlayer = room.addPlayer(clientId)

            if (newPlayer) {
                notifyPlayersOfLandTransfer(room, newPlayer)
            }
        }

        socket.emit('joined', { room: rooms[roomId] })
    })
})

io.listen(3001)

console.log('Server is happy')

function notifyPlayersOfLandTransfer(room: Room, newPlayer: Player) {
    Object.values(room.players).forEach((p) => {
        playerIdToSocket[p.id].emit('transfer', {
            landId: newPlayer.land[0],
            playerId: newPlayer.id,
        })
    })
}
