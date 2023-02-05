import { DefaultEventsMap } from '@socket.io/component-emitter'
import { mergeDeepRight } from 'rambda'
import { useSyncExternalStore } from 'react'
import { io, Socket } from 'socket.io-client'
import { Connection, OnDiff, RoomResponse } from '../types/types'
import { useClientId } from './useClientId'

export class RoomClient {
    socket: Socket<DefaultEventsMap, DefaultEventsMap>
    room?: RoomResponse
    listeners = new Set<(room?: RoomResponse) => void>()
    connectLandListeners = new Set<(connectLand: Connection) => void>()

    constructor(origin = 'http://localhost:3001') {
        this.socket = io(origin)
        this.socket.connect()
        this.socket.on('diff', (response) => this.onDiff(response))
        this.socket.on('land-connected', (response) => {
            this.connectLandListeners.forEach((listener) => listener(response))
        })
    }

    create(clientId: string) {
        this.socket.emit('create', clientId)
    }

    begin(roomId: string, clientId: string) {
        this.socket.emit('begin', roomId, clientId)
    }

    join(roomId: string, clientId: string) {
        this.socket.emit('join', roomId, clientId)
    }

    leave() {
        this.socket.emit('leave')
    }

    connectLand(
        roomId: string,
        clientId: string,
        landIdA: number,
        landIdB: number
    ) {
        this.socket.emit('connect-land', roomId, clientId, landIdA, landIdB)
    }

    getRoom() {
        return this.room
    }

    onDiff({ room: roomPartial }: OnDiff) {
        if (this.room === undefined) {
            this.room = roomPartial as RoomResponse
        } else {
            this.room = mergeDeepRight(this.room, roomPartial)
        }

        this.listeners.forEach((listener) => listener(this.room))
    }

    subscribe(listener: (room?: RoomResponse) => void) {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
    }

    subscribeToConnectLand(listener: (connectLand: Connection) => void) {
        this.connectLandListeners.add(listener)
        return () => this.connectLandListeners.delete(listener)
    }
}

export const roomClient = new RoomClient()

export const useRoomQuery = <R>(selector: (room?: RoomResponse) => R): R =>
    useSyncExternalStore(roomClient.subscribe.bind(roomClient), () =>
        selector(roomClient.getRoom())
    )

export const useRoomMutation = () => {
    const clientId = useClientId()

    return {
        create: () => roomClient.create(clientId),
        begin: (roomId: string) => roomClient.begin(roomId, clientId),
        join: (roomId: string) => roomClient.join(roomId, clientId),
        leave: () => roomClient.leave,
    }
}
