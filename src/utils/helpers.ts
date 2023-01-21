import { Color } from 'excalibur'
import { Point, Points } from '../types/types'

export const getMins = (cells: any) => {
  return cells.reduce((acc: [Point, Point], points: Points) => {
    acc[0] = acc[0] == undefined || points[0] < acc[0] ? points[0] : acc[0]
    acc[1] = acc[1] == undefined || points[1] < acc[1] ? points[1] : acc[1]
    return acc
  }, [])
}

export function randomVal(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + 1) + min
}

export const randomColour = () =>
  Color.fromRGB(randomVal(0, 255), randomVal(100, 255), randomVal(200, 255))
