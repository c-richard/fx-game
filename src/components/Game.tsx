import { useEffect } from 'react'
import { Engine, Actor, vec, Vector, Color, Line, Polygon } from 'excalibur'
import { Room } from '../types/Room'
import { generateVoronoi } from './map'

export function Game({ room }: { room: Room }) {
    useEffect(() => {
        const game = new Engine({
            canvasElementId: 'legame',
            width: 1000,
            height: 1000,
        })

        const voronoi = generateVoronoi(room.points, [0, 0, 1000, 1000])

        room.points.forEach(([ox, oy], i) => {
            const cell = voronoi.cellPolygon(i)

            cell.forEach((point, i) => {
                const a = point
                const b = cell[(i + 1) % cell.length]

                const lineActor = new Actor({
                    pos: vec(0, 0),
                })

                lineActor.anchor = Vector.Zero

                lineActor.graphics.use(
                    new Line({
                        start: vec(a[0], a[1]),
                        end: vec(b[0], b[1]),
                        color: Color.Green,
                        thickness: 1,
                    })
                )

                game.add(lineActor)
            })
        })

        game.start()
    }, [])
    return <div>Game {room.id}</div>
}
