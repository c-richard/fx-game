import { useState, useEffect } from "react";
import { socketClient } from "../utils/SocketClient";

import { Game } from "./Game";
import { Room } from "../types/Room";

function App() {
  const [error, setError] = useState<string>();
  const [roomIdInput, setRoomIdInput] = useState("");
  const [room, setRoom] = useState<Room>();

  useEffect(() => {
    socketClient.onRoomCreated = (room) => {
      console.log("set room", room);

      setError("");
      setRoom(room);
    };
    socketClient.onRoomJoined = (room) => {
      if (room === null) {
        setError("Room not found");
        return;
      }

      setError("");
      setRoom(room);
    };
  });

  async function onHostGame() {
    socketClient.createRoom();
  }

  async function onJoinGame() {
    socketClient.joinRoom(roomIdInput);
  }

  console.log(room);
  return (
    <div className="App">
      <h1>4x Game</h1>
      <div className="card">
        {room ? (
          <Game room={room} />
        ) : (
          <>
            <button onClick={onHostGame}>Host game</button>
            <input
              type="text"
              onChange={(e) => setRoomIdInput(e.target.value)}
            />
            <button onClick={onJoinGame}>Join game</button>
            {error && <p>{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
