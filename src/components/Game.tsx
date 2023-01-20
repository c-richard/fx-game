import { useEffect } from "react";
import { Engine } from "excalibur";
import { Room } from "../types/Room";

export function Game({ room }: { room: Room }) {
  useEffect(() => {
    const game = new Engine({
      width: 800,
      height: 600,
    });

    game.start();
  }, []);

  return <div>Game {room.id}</div>;
}
