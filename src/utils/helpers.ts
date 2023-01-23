import { Color } from 'excalibur'
import { Point } from '../types/types'

export const getMins = (cells: Point[]) =>
    cells.reduce(
        ([minX, minY], [x, y]) => [x < minX ? x : minX, y < minY ? y : minY],
        [Infinity, Infinity]
    )

export function randomVal(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + 1) + min
}

export const randomColour = () =>
    Color.fromRGB(randomVal(0, 255), randomVal(100, 255), randomVal(200, 255))
