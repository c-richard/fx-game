import { useEffect } from 'react'
import { useRoomMutation, useRoomQuery } from '../utils/roomClient'
import { useClientId } from '../utils/useClientId'

export function Lobby({ roomId }: { roomId: string }) {
    const clientId = useClientId()
    const room = useRoomQuery((r) => r)
    const { join, leave, begin } = useRoomMutation()

    useEffect(() => {
        if (room == null || room.id !== roomId) {
            join(roomId)
        }

        return () => {
            if (room && room.stage === 'LOBBY') leave()
        }
    }, [roomId])

    return (
        <>
            {room ? (
                <>
                    <p>Lobby: {roomId}</p>
                    {Object.values(room.players).map((player) => {
                        return <p key={player.id}>Player: {player.id}</p>
                    })}
                    {room.host.id === clientId && (
                        <button onClick={() => begin(roomId)}>Start</button>
                    )}
                </>
            ) : (
                <p>Lobby not found</p>
            )}
        </>
    )
}
