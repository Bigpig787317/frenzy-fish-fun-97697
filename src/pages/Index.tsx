import React, { useState } from "react";
import FishingGame from "@/components/FishingGame"; // default import

type Difficulty = "mild" | "medium" | "spicy";
type Screen = "splash" | "home" | "game";

const Index: React.FC = () => {
  const [screen, setScreen] = useState<Screen>("splash");
  const [difficulty, setDifficulty] = useState<Difficulty>("mild");

  // Splash screen (blank)
  if (screen === "splash") {
    return (
      <div
        className="w-screen h-screen bg-white dark:bg-black"
        onClick={() => setScreen("home")}
        role="button"
        aria-label="Continue"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setScreen("home");
        }}
      />
    );
  }

  // Home screen (choose difficulty)
  if (screen === "home") {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-b from-sky-300 to-sky-200">
        <div className="flex flex-col gap-4 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Choose Your Level</h1>

          <button
            className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-lg text-white text-xl"
            onClick={() => {
              setDifficulty("mild");
              setScreen("game");
            }}
          >
            Mild 🌶️
          </button>

          <button
            className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-white text-xl"
            onClick={() => {
              setDifficulty("medium");
              setScreen("game");
            }}
          >
            Medium 🌶️🌶️
          </button>

          <button
            className="px-8 py-4 bg-red-500 hover:bg-red-600 rounded-lg text-white text-xl"
            onClick={() => {
              setDifficulty("spicy");
              setScreen("game");
            }}
          >
            Spicy 🌶️🌶️🌶️
          </button>
        </div>
      </div>
    );
  }

  // Game screen (pass selected difficulty)
  return <FishingGame difficulty={difficulty} />;
};

export default Index;

