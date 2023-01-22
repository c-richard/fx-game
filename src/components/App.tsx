import { useState, useEffect } from 'react'
import { socketClient } from '../utils/client'

import { Game } from './Game'
import { Room } from '../types/types'
import { Route, useLocation } from 'wouter'

function App() {
    const [error, setError] = useState<string>()
    const [roomIdInput, setRoomIdInput] = useState('')
    const [room, setRoom] = useState<Room>()
    const [, setLocation] = useLocation()

    const clientId = localStorage.getItem('id') as string

    useEffect(() => {
        socketClient.onJoined = ({ room }) => {
            if (room == null) {
                setError('Room not found')
                return
            }

            setError('')
            setRoom(room)
            setLocation(`/room/${room.id}`)
        }
    }, [])

    return (
        <div className="App">
            <Route path="/">
                <h1>4x Game</h1>
                <button onClick={() => socketClient.createRoom(clientId)}>
                    Host game
                </button>
                <input
                    type="text"
                    onChange={(e) => setRoomIdInput(e.target.value)}
                />
                <button
                    onClick={() => socketClient.joinRoom(roomIdInput, clientId)}
                >
                    Join game
                </button>
                {error && <p>{error}</p>}
            </Route>
            <Route<{ roomId: string }> path="/room/:roomId">
                {({ roomId }) => <Game roomId={roomId} room={room} />}
            </Route>
        </div>
    )
}

export default App
