import { useEffect } from 'react'
import { roomClient, useRoomMutation } from '../utils/roomClient'
import { CustomGame } from '../utils/game'

export function Game({ roomId }: { roomId: string }) {
    const { join, leave } = useRoomMutation()
    const room = roomClient.getRoom()

    useEffect(() => {
        if (room == null) {
            join(roomId)
            return
        }

        const game = new CustomGame(room, roomClient)

        game.start()

        return () => {
            game.stop()
            leave()
        }
    }, [room])

    return room ? (
        <div>
            <canvas id="legame"></canvas>
            Game {room.id}
        </div>
    ) : (
        <p>Cloud turn into a sqwuare shape</p>
    )
}
