import { Server, Socket } from 'socket.io'
import { onCreate, onBegin, onJoin, onDisconnect } from './handlers/index.js'
import { onConnectLand } from './handlers/onConnectLand.js'
import { socketRepository } from './models/repositories.js'

const io = new Server({
    cors: {
        origin: 'http://localhost:8000',
    },
})

io.on('connection', (socket: Socket) => {
    socketRepository.save(socket)
    socket.on('create', onCreate)
    socket.on('begin', onBegin)
    socket.on('join', onJoin)
    socket.on('disconnect', onDisconnect)
    socket.on('leave', onDisconnect)
    socket.on('connect-land', onConnectLand)
})

io.listen(3001)

console.log('Praise the dog')
