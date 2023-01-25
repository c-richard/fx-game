import { Socket } from 'socket.io'
import { Room } from './room'

class Repository<T extends { id: string }> {
    items: Partial<Record<string, T>> = {}

    save(item: T) {
        this.items[item.id] = item
    }

    remove(item: T) {
        if (this.items[item.id] === undefined) {
            throw new Error('Item does not exist to remove')
        }

        this.items[item.id] = undefined
        delete this.items[item.id]
    }

    getAll() {
        return Object.values(this.items) as T[]
    }

    getById(itemId: string) {
        return this.items[itemId]
    }
}

export const socketRepository = new Repository<Socket>()
export const roomRepository = new Repository<Room>()
