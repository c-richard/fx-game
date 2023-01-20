import { Delaunay } from 'd3-delaunay'

type Point = [x: number, y: number]

export const generateSomething = (points: Array<Point>) => {
    const delaunay = Delaunay.from(points)
    const voronoi = delaunay.voronoi([0, 0, 960, 500])

    return voronoi
}
