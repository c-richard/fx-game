import { Room } from "../types/Room";

export function Game({ room }: { room: Room }) {
  return <div>Game {room.id}</div>;
}
