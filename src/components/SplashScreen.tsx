// imports
import React, { useState } from "react";
import { FishingGame } from "./FishingGame";
import Levels from "./Levels";
import { Button } from "./ui/button";
import { ref, set } from "firebase/database";
import { database } from "../firebase";

interface SplashScreenProps {
  onStart: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [hostCode, setHostCode] = useState("");

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
    onStart();
  };
  // when user clicks join button
  const handleJoin = () => {
    if (!joinCode) {
      alert("Enter a code!");
      return;
    }
    onStart();
  };

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
      ) : (
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
      )}
    </div>
  );
};
export default SplashScreen;
