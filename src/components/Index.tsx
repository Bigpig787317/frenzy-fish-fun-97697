import React, { useState } from "react";
import FishingGame from "@/components/FishingGame"; // default import
import SplashScreen from "@/components/SplashScreen"; // default import
import Levels from "@/components/Levels"; // default import

type Difficulty = "mild" | "medium" | "spicy";
type Screen = "splash" | "levels" | "game";

const Index: React.FC = () => {
  const [screen, setScreen] = useState<"splash" | "levels" | "game">("splash");
  const [difficulty, setDifficulty] = useState<Difficulty>("mild");

if (screen === "splash") 
  return <SplashScreen onStart={() => setScreen("levels")} />;
if (screen === "levels") 
  return <Levels onStart={() => setScreen("game")} gameCode={""} />;
if (screen === "game") 
  return <FishingGame gameCode={""} />;

  // Game screen (pass selected difficulty)
  return <FishingGame difficulty={difficulty} gameCode={""} />;
};

export default Index;
