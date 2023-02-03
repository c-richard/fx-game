import { socketRepository } from './repositories.js'

export class Player {
    id: string
    socketId: string

    constructor(id: string, socketId: string) {
        this.id = id
        this.socketId = socketId
    }

    emit(key: string, data: any) {
        const socket = socketRepository.getById(this.socketId)
        if (socket) {
            socket.emit(key, data)
        } else {
            throw new Error('Player socket not found')
        }
    }
}
