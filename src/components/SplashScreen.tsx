
// imports
import React, { useState, useEffect } from "react";
import { FishingGame } from "./FishingGame";
import Levels from "./Levels";
import { Button } from "./ui/button";
import { ref, onValue, set } from "firebase/database";
import { database } from "../firebase";

interface SplashScreenProps {
  onStart: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [hostCode, setHostCode] = useState("");
  const [started, setStarted] = useState(false);
  // NEW: state to track if another player joined
  const [otherJoined, setOtherJoined] = useState(false);

  // NEW: optional host ID if you want to track the host separately
  const hostId = "HOST"; // can just be a fixed string for now


  // generating a random code
  const generateJoinCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  };

  // when user clicks host button
  const handleHost = () => {
    const code = generateJoinCode();
    setHostCode(code);
    const gameRef = ref(database, `games/${code}`);
    set(gameRef, { communalScore: 0 });
    const hostRef = ref(database, `games/${code}/players/${hostId}`);
    set(hostRef, { joinedAt: Date.now() }); 
  };
  // when user clicks join button
  const handleJoin = () => {
    if (!joinCode) {
      alert("Enter a code!");
      return;
    }
    const joinerId = `JOINER-${Date.now()}`; // simple unique ID for joiner
    const joinRef = ref(database, `games/${joinCode}/players/${joinerId}`);
    set(joinRef, { joinedAt: Date.now() });
    setStarted(true);

  };
   // NEW: listen for other players if you are the host
   useEffect(() => {
    if (!hostCode) return; // only run if hostCode exists

    const playersRef = ref(database, `games/${hostCode}/players`);
    const unsubscribe = onValue(playersRef, (snapshot) => {
      const players = snapshot.val() || {};
      // remove host from count
      const otherPlayers = Object.keys(players).filter(id => id !== hostId);
      setOtherJoined(otherPlayers.length > 0);
    });

    return () => unsubscribe();
  }, [hostCode]);

  if (started) return <Levels gameCode={hostCode || joinCode} onStart={onStart} />;
  
  // visuals
  // visuals
return (
  <div className="w-screen h-screen flex flex-col items-center justify-center bg-blue-500 gap-6">
    <h1 className="text-white text-9xl font-bold mb-12">Math Catch</h1>

    {showJoinInput ? (
      <>
        <input
          type="text"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="Enter code"
          className="p-2 rounded text-black"
        />
        <Button onClick={handleJoin}>
          Submit
        </Button>
      </>
    ) : !hostCode ? (
      // host and join buttons
      <div className="flex gap-10">
        <Button 
          className="px-20 py-10 bg-yellow-400 text-white text-3xl rounded-xl hover:bg-yellow-600"
          onClick={handleHost}>
          Host Game
        </Button>
        <Button 
          className="px-20 py-10 bg-green-400 text-white text-3xl rounded-xl hover:bg-green-600"
          onClick={() => setShowJoinInput(true)}>
          Join Game
        </Button>
      </div>
    ) : (
      // Display host code and start button
      <div className="flex flex-col items-center gap-6">
        <p className="text-white text-5xl">
          Your Game Code: <span className="font-bold">{hostCode}</span>
        </p>

        {otherJoined && (
          <p className="text-green-400 text-3xl font-bold">
            Another player joined your game!
          </p>
        )}

        <Button
          className="px-20 py-8 bg-yellow-400 text-white text-2xl rounded-xl hover:bg-yellow-600"
          onClick={() => setStarted(true)}
        >
          Start Game
        </Button>
      </div>
    )}
  </div>
);

};
export default SplashScreen;
