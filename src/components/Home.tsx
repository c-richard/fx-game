import { useState } from 'react'
import { useRoomMutation } from '../utils/roomClient'

export function Home() {
    const [roomIdInput, setRoomIdInput] = useState('')

    const { create, join } = useRoomMutation()

    return (
        <>
            <h1>4x Game</h1>
            <button onClick={() => create()}>Host game</button>
            <input
                type="text"
                onChange={(e) => setRoomIdInput(e.target.value)}
            />
            <button onClick={() => join(roomIdInput)}>Join game</button>
        </>
    )
}
