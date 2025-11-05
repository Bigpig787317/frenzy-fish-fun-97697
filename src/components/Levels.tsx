// imports
import { useState } from "react";
import { FishingGame } from "./FishingGame";

type Difficulty = "mild" | "medium" | "spicy";

interface LevelsProps {

  onStart: () => void;
  gameCode: string;

}

const Levels: React.FC<LevelsProps> = ({ onStart, gameCode }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);

  // Once a difficulty is selected, start the game
  if (selectedDifficulty) {
    return <FishingGame difficulty={selectedDifficulty} gameCode={gameCode}/>;
  }

  // choosing your level visuals
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-b from-sky-300 to-sky-200">
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Choose Your Level</h1>

        <button
          className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-lg text-white text-xl"
          onClick={() => setSelectedDifficulty("mild")}
        >
          Mild 🌶️
        </button>

        <button
          className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-white text-xl"
          onClick={() => setSelectedDifficulty("medium")}
        >
          Medium 🌶️🌶️
        </button>

        <button
          className="px-8 py-4 bg-red-500 hover:bg-red-600 rounded-lg text-white text-xl"
          onClick={() => setSelectedDifficulty("spicy")}
        >
          Spicy 🌶️🌶️🌶️
        </button>
      </div>
    </div>
  );
};

export default Levels;