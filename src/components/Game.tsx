import { useEffect } from 'react'
import {
    Engine,
    Actor,
    vec,
    Vector,
    Color,
    Line,
    Polygon,
    DisplayMode,
    PolygonCollider,
    Circle,
    CircleCollider,
} from 'excalibur'
import { Room } from '../types/types'
import { generateVoronoi } from '../utils/generateVoronoi'
import { Delaunay } from 'd3-delaunay'
import { socketClient } from '../utils/client'
import { getMins, randomColour } from '../utils/helpers'
import Tile from './actors/tileActor'

export function Game({ roomId, room }: { roomId: string; room?: Room }) {
    useEffect(() => {
        if (room == null) {
            const clientId = localStorage.getItem('id') as string
            socketClient.joinRoom(roomId, clientId)
        } else {
            const game = new Engine({
                canvasElementId: 'legame',
                width: 1000,
                height: 1000,
                displayMode: DisplayMode.FitContainer,
            })

            const voronoi = generateVoronoi(room.points, [0, 0, 1000, 1000])
            room.points
                .forEach((_, i) => drawCell(game, voronoi.cellPolygon(i)))

            // TODO modify existing actors to indicate player ownership
            // Object.values(room.players).forEach((p) => {
            //     p.land.forEach((land) => {
            //         drawCell(game, voronoi.cellPolygon(land), true)
            //     })
            // })

            game.start()

            // TODO modify existing actors to indicate player ownership
            // socketClient.onTransfer = ({ landId }) => {
            //     drawCell(game, voronoi.cellPolygon(landId), true)
            // }

            return () => game.stop()
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

function drawCell(
    game: Engine,
    cell: Delaunay.Polygon,
    owned: boolean = false
): any {
    drawPolygon(game, cell, owned)

    cell.forEach((point, i) => {
        drawLine(game, point, cell[(i + 1) % cell.length])
    })
}

function drawPolygon(
    game: Engine,
    cell: Delaunay.Polygon,
    ownerId: boolean = false
) {
    const [minX, minY] = getMins(cell)

    const polygonAsVector = cell.map(([x, y]) => vec(x, y))

    const tileActor = new Tile({
        pos: vec(minX, minY),
        tileColor: ownerId ? Color.Red : Color.ExcaliburBlue,
        polygon: polygonAsVector,
        ownerId: null,
        type: 'UNKNOWN',
    })

    tileActor.anchor = Vector.Zero

    game.add(tileActor)
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
