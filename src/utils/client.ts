import { DefaultEventsMap } from '@socket.io/component-emitter'
import { io, Socket } from 'socket.io-client'
import { Room } from '../types/types'

export class Client {
    socket: Socket<DefaultEventsMap, DefaultEventsMap>

    onRoomCreated: (room: Room) => void = () => {}
    onRoomJoined: (room?: Room) => void = () => {}

    constructor(origin = 'http://localhost:3001') {
        this.socket = io(origin)
        this.socket.connect()

        this.socket.on('created-room', (room) => this.onRoomCreated(room))
        this.socket.on('joined-room', (room) => this.onRoomJoined(room))
    }

    createRoom() {
        this.socket.emit('create-room')
    }

    joinRoom(id: string) {
        this.socket.emit('join-room', id)
    }
}

export const socketClient = new Client()
