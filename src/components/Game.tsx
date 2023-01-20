import { useEffect } from 'react'
import { Engine, Actor, vec, Vector, Color, Line } from 'excalibur'
import { Room } from '../types/Room'
import { generateSomething } from './map'

export function Game({ room }: { room: Room }) {
    useEffect(() => {
        const game = new Engine({
            canvasElementId: 'legame',
            width: 800,
            height: 600,
        })

        const lineActor = new Actor({
            pos: vec(100, 0),
        })
        lineActor.graphics.anchor = Vector.Zero
        lineActor.graphics.use(
            new Line({
                start: vec(0, 0),
                end: vec(200, 200),
                color: Color.Green,
                thickness: 1,
            })
        )

        generateSomething(room.points)
        game.add(lineActor)
        game.start()
    }, [])
    return <div>Game {room.id}</div>
}
