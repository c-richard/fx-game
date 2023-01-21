import { Delaunay } from 'd3-delaunay'

type Point = [x: number, y: number]

export const generateVoronoi = (
    points: Array<Point>,
    bounds: [number, number, number, number]
) => {
    const delaunay = Delaunay.from(points)
    return delaunay.voronoi(bounds)
}
