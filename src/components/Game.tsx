import { useEffect } from 'react'
import { Engine, Actor, vec, Vector, Color, Line, Polygon } from 'excalibur'
import { Room } from '../types/types'
import { generateVoronoi } from '../utils/generateVoronoi'
import { Delaunay } from 'd3-delaunay'

export function Game({ room }: { room: Room }) {
    useEffect(() => {
        const game = new Engine({
            canvasElementId: 'legame',
            width: 1000,
            height: 1000,
        })

        const voronoi = generateVoronoi(room.points, [0, 0, 1000, 1000])
        room.points.forEach((_, i) => drawCell(game, voronoi.cellPolygon(i)))

        game.start()
    }, [])
    return <div>Game {room.id}</div>
}

function drawCell(game: Engine, cell: Delaunay.Polygon): any {
    drawPolygon(game, cell)

    cell.forEach((point, i) => {
        drawLine(game, point, cell[(i + 1) % cell.length])
    })
}

function drawPolygon(game: Engine, cell: Delaunay.Polygon) {
    const minX = Math.min(...cell.map((p) => p[0]))
    const minY = Math.min(...cell.map((p) => p[1]))

    const polygonAsVector = cell.map(([x, y]) => vec(x, y))

    const cellActor = new Actor({
        pos: vec(minX, minY),
    })

    cellActor.anchor = Vector.Zero
    cellActor.graphics.use(
        new Polygon({
            points: polygonAsVector,
            color: Color.ExcaliburBlue,
        })
    )

    game.add(cellActor)
}

function drawLine(game: Engine, a: Delaunay.Point, b: Delaunay.Point) {
    const lineActor = new Actor({
        pos: vec(0, 0),
    })

    lineActor.anchor = Vector.Zero

    lineActor.graphics.use(
        new Line({
            start: vec(a[0], a[1]),
            end: vec(b[0], b[1]),
            color: Color.Vermilion,
            thickness: 5,
        })
    )

    game.add(lineActor)
}
