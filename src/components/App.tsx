import { Game } from './Game'
import { Route, useLocation } from 'wouter'
import { Lobby } from './Lobby'
import { Home } from './Home'
import { useRoomQuery } from '../utils/roomClient'
import { useEffect } from 'react'

function App() {
    const stage = useRoomQuery((r) => r?.stage)
    const roomId = useRoomQuery((r) => r?.id)
    const [location, setLocation] = useLocation()

    useEffect(() => {
        if (stage === 'LOBBY' && location === '/') {
            setLocation(`/room/${roomId}/lobby`)
        }
        if (stage === 'PLAY' && location === '/') {
            setLocation(`/room/${roomId}/play`)
        }
        if (stage === 'PLAY' && location === `/room/${roomId}/lobby`) {
            setLocation(`/room/${roomId}/play`, { replace: true })
        }
    }, [roomId, stage])

    return (
        <div className="App">
            <Route path="/">
                <Home />
            </Route>
            <Route<{ roomId: string }> path="/room/:roomId/lobby">
                {({ roomId }) => <Lobby roomId={roomId} />}
            </Route>
            <Route<{ roomId: string }> path="/room/:roomId/play">
                {({ roomId }) => <Game roomId={roomId} />}
            </Route>
        </div>
    )
}

export default App
