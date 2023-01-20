import { Delaunay } from "d3-delaunay";

export type Point = [x: number, y: number];

const generateVoronoi = (points: Array<Point>) => {
    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi([0, 0, 960, 500]);

    return voronoi;
}
