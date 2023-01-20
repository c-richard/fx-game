import { range } from "rambda";

const generateNumber = (min: number, max: number) =>
  Math.min(max, Math.max(min, Math.random() * 1000));

const generatePoint = (min: number, max: number) =>
  [generateNumber(min, max), generateNumber(min, max)] as const;

export class Room {
  id: string;
  players: string[];
  points: (readonly [x: number, y: number])[];

  constructor(id: string) {
    this.id = id;
    this.points = range(1, 64).map(() => generatePoint(0, 1000));
    this.players = [];
  }
}
