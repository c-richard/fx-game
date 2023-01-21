import { Delaunay } from 'd3-delaunay'
import { Point } from '../types/types'

export const generateVoronoi = (
    points: Point[],
    bounds: [number, number, number, number]
) => {
    const delaunay = Delaunay.from(points)
    return delaunay.voronoi(bounds)
}
