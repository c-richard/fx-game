import { Server } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import { Room } from './room'

const rooms: Record<string, Room> = {}

const io = new Server({
    cors: {
        origin: 'http://localhost:8000',
    },
})

io.on('connection', (socket) => {
    socket.on('create-room', () => {
        const room = new Room(uuidv4())
        rooms[room.id] = room
        rooms[room.id].addPlayer(socket.id)

        socket.emit('created-room', JSON.stringify(room))
    })

    socket.on('join-room', (roomId) => {
        if (rooms[roomId]) {
            rooms[roomId].addPlayer(socket.id)
        }

        socket.emit('joined-room', rooms[roomId])
    })
})

io.listen(3001)

console.log('Server is happy')
