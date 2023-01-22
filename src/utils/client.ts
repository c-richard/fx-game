import { DefaultEventsMap } from '@socket.io/component-emitter'
import { io, Socket } from 'socket.io-client'
import { Room } from '../types/types'

export interface OnTransfer {
    landId: number
    playerId: string
}

export interface OnJoined {
    room: Room
}

export interface OnWinner {
    playerId: string
}

export class Client {
    socket: Socket<DefaultEventsMap, DefaultEventsMap>

    onTransfer: (response: OnTransfer) => void = () => {}
    onJoined: (response: OnJoined) => void = () => {}
    onWinner: (response: OnWinner) => void = () => {}

    constructor(origin = 'http://localhost:3001') {
        this.socket = io(origin)
        this.socket.connect()

        this.socket.on('joined', (response) => this.onJoined(response))
        this.socket.on('transfer', (response) => this.onTransfer(response))
        this.socket.on('winner', (response) => this.onWinner(response))
    }

    createRoom(clientId: string) {
        this.socket.emit('create', clientId)
    }

    joinRoom(roomId: string, clientId: string) {
        this.socket.emit('join', roomId, clientId)
    }
}

export const socketClient = new Client()
