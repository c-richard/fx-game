import { useState, useEffect } from 'react'
import { socketClient } from '../utils/client'

import { Game } from './Game'
import { Room } from '../types/types'
import { Route, useLocation } from 'wouter'
import { Lobby } from './Lobby'

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

            if (room.stage == 'LOBBY') setLocation(`/room/${room.id}/lobby`)
            if (room.stage == 'PLAY') setLocation(`/room/${room.id}/play`)
            if (room.stage == 'ENDED') setLocation(`/room/${room.id}/ended`)
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
            <Route<{ roomId: string }> path="/room/:roomId/lobby">
                {({ roomId }) => <Lobby roomId={roomId} room={room} />}
            </Route>
            <Route<{ roomId: string }> path="/room/:roomId/play">
                {({ roomId }) => <Game roomId={roomId} room={room} />}
            </Route>
        </div>
    )
}

export default App
