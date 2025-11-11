// imports
import { ref, onValue } from "firebase/database";
import { database } from "../firebase"; // import the database reference
import { runTransaction } from "firebase/database";
import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Fish as FishIcon, Anchor, Cloud } from "lucide-react";
import seaweedGreenA from "@/assets/seaweed_green_a.svg";
import seaweedGrass from "@/assets/seaweed_grass.svg";
import seaweedGreenC from "@/assets/seaweed_green_c.svg";
import seaweedPink from "@/assets/seaweed_pink.svg";
import seaweedOrange from "@/assets/seaweed_orange.svg";type Difficulty = "mild" | "medium" | "spicy";
import fish_blue from "@/assets/fish_blue_outline.svg";
import fish_brown from "@/assets/fish_brown_outline.svg";
import fish_green from "@/assets/fish_green_outline.svg";
import fish_pink from "@/assets/fish_pink_outline.svg";
import fish_orange from "@/assets/fish_orange_outline.svg";
import fish_red from "@/assets/fish_red_outline.svg";

type Screen = "splash" | "levels" | "game";

const fishies = [
 fish_blue,
fish_brown,
 fish_green,
fish_pink,
fish_orange,
fish_red
];
interface Fish {
  id: number;
  x: number;
  y: number;
  size: "small" | "medium" | "large";
  speed: number;
  direction: 1 | -1;
  color: string;
  image?: string;
 // isShark?: boolean;
}

interface Coral {
  id: number;
  x: number;
  height: number;
  seaweedType: string;
}
interface FishingGameProps {
  difficulty?: "mild" | "medium" | "spicy"; // make it optional
  gameCode: string; // NEW
}

const questions_mild = ["2 × 3 ="," 5 × 4 =", "10 × 7 =", "2 × 8 =", "5 × 6 =", "10 × 9 =", "5 × 2 =", "10 × 3 =", "2 × 12 ="];
const answers_mild = ["6", "20", "70", "16", "30", "90", "10", "30", "24"];
const questions_medium = [
  "3 × 7 =",
  "4 × 9 =",
  "6 × 8 =",
  "9 × 5 =",
  "8 × 7 =",
  "3 × 12 =",
  "4 × 6 =",
  "9 × 3 =",
  "8 × 4 =",
  "6 × 7 ="
];
const answers_medium = ["21", "36", "48", "45", "56", "36", "24", "27", "32", "42"];
const questions_spicy = [
  "7 × 9 =",
  "12 × 8 =",
  "11 × 6 =",
  "A box has 9 rows of 8 apples. How many apples are there in total?",
  "144 ÷ 12 =",
  "7 × 8 =",
  "10 × 12 =",
  "A spider has 8 legs. How many legs do 6 spiders have?",
  "9 × 11 =",
  "96 ÷ 8 ="
];
const answers_spicy = ["63", "96", "66", "72", "12", "56", "120", "48", "99", "12"];



// when you type in a question answer

// const question = "what is 9+10?";
// const correctAnswer = "19";


export const FishingGame: React.FC<FishingGameProps> = ({ difficulty = "mild", gameCode }) => {
  const scoreRef = ref(database, `games/${gameCode}/communalScore`);
  const [showQuestion, setShowQuestionState] = useState(false);
  const [baitNo, setBaitNo] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswerValue, setCurrentAnswerValue] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [hookY, setHookY] = useState(0);
  const [boatX, setBoatX] = useState(50);
  const [isCasting, setIsCasting] = useState(false);
  const [isReeling, setIsReeling] = useState(false);
  const [fish, setFish] = useState<Fish[]>([]);
  const [coral, setCoral] = useState<Coral[]>([]);
  const seaweedTypes = [seaweedGreenA, seaweedGrass, seaweedGreenC, seaweedPink, seaweedOrange];
  const [caughtFish, setCaughtFish] = useState<Fish | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const hookSpeed = 3;
  const [communalScore, setCommunalScore] = useState(0);
  const fishColors = ["hsl(var(--fish-orange))", "hsl(var(--fish-yellow))", "hsl(var(--coral))"];
  const fishSizes = {
    small: { width: 30, height: 20, points: 10 },
    medium: { width: 50, height: 35, points: 25 },
    large: { width: 70, height: 50, points: 50 },
    //shark: { width: 80, height: 60, points: 100 },
  };

  const setShowQuestion = (b: boolean) => {
    setShowQuestionState(b);
  };

  function q_generator(){
    const QNo = Math.floor(Math.random() * 10);
    if (difficulty === "mild"){
      setCurrentQuestion(questions_mild[QNo]);
      setCurrentAnswerValue(answers_mild[QNo]);
    } else if (difficulty === "medium") {
      setCurrentQuestion(questions_medium[QNo]);
      setCurrentAnswerValue(answers_medium[QNo]);
    } else {
      setCurrentQuestion(questions_spicy[QNo]);
      setCurrentAnswerValue(answers_spicy[QNo]);
    }
    setShowQuestion(true);
  };

  // Debug: check the gameCode for host/joiner
  useEffect(() => {
    console.log("Listening to gameCode:", gameCode);
  }, [gameCode]);
  const handleSubmitAnswer = () => {
    if (currentAnswer === currentAnswerValue) {
      setBaitNo(prev => prev + 1); // Reward: add 1 bait
      alert("Correct!");
    } else {
      alert("Try again!");
    }
    setCurrentAnswer("");      // Clear the input for next time
    setShowQuestion(false);    // Hide the question modal
  };
    
  //Timer
    useEffect(() => {
      if (timeLeft <= 0) return; // stop at 0
      const interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }, [timeLeft]);
 
    // Listen for communal score updates in Firebase
  useEffect(() => {
    if (!gameCode) return;

    const scoreRef = ref(database, `games/${gameCode}/communalScore`);
    const unsubscribe = onValue(scoreRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null) setCommunalScore(value); // use your state variable
    });

    return () => unsubscribe();
  }, [gameCode]);

  
  // Keyboard controls for boat movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setBoatX((prev) => Math.max(10, prev - 2));
      } else if (e.key === "ArrowRight") {
        setBoatX((prev) => Math.min(90, prev + 2));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  
  useEffect(() => {
    const initialCoral: Coral[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: (i * 8) + Math.random() * 5,
      height: 40 + Math.random() * 30,
      seaweedType: seaweedTypes[Math.floor(Math.random() * seaweedTypes.length)],
    }));
    setCoral(initialCoral);
  }, []);

  // Initialize fish and sharks
  useEffect(() => {
       const spawnInterval = setInterval(() => {
         setFish(prev => {
          if (prev.length > 10) return prev;

          const newFish: Fish = {
            id: Date.now(), // check why this change
            x: Math.random() > 0.5 ? -5 : 105,
            y: 20 + Math.random() * 70,
            size: Math.random() > 0.6 ? "large" : Math.random() > 0.4 ? "medium" : "small",
            speed: 0.3 + Math.random() * 0.4,
            direction: Math.random() > 0.5 ? 1 : -1,
            color: fishColors[Math.floor(Math.random() * fishColors.length)], // check if i need colour
            image: fishies[Math.floor(Math.random() * fishies.length)], // randomly assigns fish image to a fish

          };
          return [...prev, newFish];
         });
      }, 2000);

      return () => clearInterval(spawnInterval);
    }, []);

    useEffect(() => {
      const interval = setInterval(() => {
       setFish(prevFish =>
            prevFish
                .map(f => ({ ...f, x: f.x + f.speed * f.direction }))
                .filter(f => f.x > -10 && f.x < 150)// remove if offscreen

        );
}, 50); // come back and looka t chat here
return () => clearInterval(interval);
}, []);



  // Handle casting and reeling
  useEffect(() => {
    if (!isCasting && !isReeling) return;

    const interval = setInterval(() => {
      setHookY((prev) => {
        if (isCasting) {
          const newY = prev + hookSpeed;
          if (newY >= 100) {
            setIsCasting(false);
            setIsReeling(true);
            return 100;
          }
          // Check for fish collision while casting
          checkFishCollision(newY);
          return newY;
        } else if (isReeling) {
          const newY = prev - hookSpeed;
          if (newY <= 0) {
            setIsReeling(false);
            if (caughtFish) {
              const points = fishSizes[caughtFish.size].points;
              // Update the communal score safely for all players
              const scoreRef = ref(database, `games/${gameCode}/communalScore`);
              runTransaction(scoreRef, (current) => {
                return (current || 0) + points;
              });

              // Remove caught fish and add new one
              setFish((prevFish) => {
                const newFish = prevFish.filter((f) => f.id !== caughtFish.id);
                const isNewShark = Math.random() > 0.8; // 20% chance for shark
                const newFishItem: Fish = {
                  id: Date.now(),
                  x: Math.random() * 100,
                  y: 20 + Math.random() * 70,
                  size: isNewShark ? "large" : Math.random() > 0.6 ? "large" : Math.random() > 0.4 ? "medium" : "small",
                  speed: isNewShark ? 0.2 + Math.random() * 0.2 : 0.1 + Math.random() * 0.3,
                  direction: Math.random() > 0.5 ? 1 : -1,
                  color: isNewShark ? "hsl(200, 10%, 30%)" : fishColors[Math.floor(Math.random() * fishColors.length)],

                };
                return [...newFish, newFishItem];
              });
              setCaughtFish(null);
            }
            return 0;
          }
          return newY;
        }
        return prev;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isCasting, isReeling, caughtFish]);

  const checkFishCollision = (currentHookY: number) => {
    if (caughtFish) return;

    const hookX = boatX; // Hook follows boat position
    const catchRadius = 2;

    for (const f of fish) {
      const distance = Math.sqrt(Math.pow(hookX - f.x, 2) + Math.pow(currentHookY - f.y, 2));
      if (distance < catchRadius) {
        setCaughtFish(f);
        setIsCasting(false);
        setIsReeling(true);
        break;
      }
    }
  };

  const handleCast = () => {
    if (!isCasting && !isReeling && hookY === 0 && baitNo > 0) {
      setIsCasting(true);
      // Bait number minus one every time we fish
      setBaitNo((prev) => prev - 1);
    }
  };
  //test question
 // const question = "what is 9+10?";
 // const correctAnswer = "19";

  // // when you type in a question answer
  // const handleSubmitAnswer = () => {
  //   if (currentAnswer === correctAnswer) {
  //     setBaitNo(prev => prev + 1); // Reward: add 1 bait
  //     alert("Correct!");
  //   } else {
  //     alert("Try again!");
  //   }
  //   setCurrentAnswer("");      // Clear the input for next time
  //   setShowQuestion(false);    // Hide the question modal
  // };
  //
  // // refill bait button
  // <Button onClick={() => setShowQuestion(true)}>
  //   Refill Bait
  // </Button>

  const handleReset = () => {
    setHookY(0);
    setBoatX(50);
    setIsCasting(false);
    setIsReeling(false);
    setCaughtFish(null);

  };
  // visuals
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Sky Background with Clouds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Cloud className="absolute top-10 left-[10%] w-16 h-16 text-white/70 animate-pulse" style={{ animationDuration: "4s" }} />
        <Cloud className="absolute top-20 left-[30%] w-20 h-20 text-white/60 animate-pulse" style={{ animationDuration: "5s" }} />
        <Cloud className="absolute top-16 right-[20%] w-24 h-24 text-white/50 animate-pulse" style={{ animationDuration: "6s" }} />
        <Cloud className="absolute top-32 right-[40%] w-16 h-16 text-white/65 animate-pulse" style={{ animationDuration: "4.5s" }} />
        <Cloud className="absolute top-8 left-[60%] w-20 h-20 text-white/55 animate-pulse" style={{ animationDuration: "5.5s" }} />
      </div>
      {showQuestion && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col gap-6 items-center w-80 font-sans">
            {/* Question */}
            <p className="text-5xl font-semibold text-center">{currentQuestion}</p>

            {/* Input */}
            <input
              type="text"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="border p-2 w-full text-center text-lg rounded"
            />

            {/* Buttons: Cancel left, Submit right */}
            <div className="flex justify-between w-full mt-2 gap-2">
              <Button onClick={() => setShowQuestion(false)}>Cancel</Button>
              <Button onClick={handleSubmitAnswer}>Submit</Button>
            </div>
          </div>
        </div>
      )}
      <Card className="p-6 mb-4 bg-white/90 backdrop-blur shadow-lg">
        <div className="flex items-center justify-between gap-8">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Team Score</p>
            <p className="text-3xl font-bold text-primary">{communalScore}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Bait</p>
            <p className="text-3xl font-bold text-primary">{baitNo}</p>
          </div>
          <div className="flex gap-4 flex-wrap items-center">
            <Button onClick={q_generator}>
              Refill Bait
            </Button>
            <Button
                onClick={handleCast}
                disabled={isCasting || isReeling}
              className="bg-primary hover:bg-primary/90"
            >
              <Anchor className="mr-2 h-4 w-4" />
              Cast Line
            </Button>
            <div className="flex gap-1">
              <Button
                onClick={() => setBoatX((prev) => Math.max(10, prev - 5))}
                variant="outline"
                size="icon"
                disabled={isCasting || isReeling}
              >
                ←
              </Button>
              <Button
                onClick={() => setBoatX((prev) => Math.min(90, prev + 5))}
                variant="outline"
                size="icon"
                disabled={isCasting || isReeling}
              >
                →
              </Button>
            </div>
            {/* Time Left moved here */}
            <div className="text-center ml-4">
              <p className="text-sm font-medium text-muted-foreground">Time Left</p>
              <p className="text-3xl font-bold text-primary">{timeLeft}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="relative w-full max-w-3xl h-[600px] overflow-hidden shadow-2xl">
        <div
          ref={gameAreaRef}
          className="w-full h-full relative"
          style={{
            background: "var(--gradient-ocean)",
          }}
        >
          {/* Water surface effect */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/30" />

          {/* Boat */}
          <div 
            className="absolute top-0 -translate-x-1/2 -translate-y-2 z-20 transition-all duration-200"
            style={{ left: `${boatX}%` }}
          >
            <div className="w-20 h-8 bg-gradient-to-b from-amber-700 to-amber-900 rounded-b-2xl shadow-lg">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-6 bg-amber-600 rounded-t-lg" />
            </div>
          </div>

          {/* Fishing Line */}
          {(isCasting || isReeling || hookY > 0) && (
            <div
              className="absolute -translate-x-1/2 w-0.5 bg-gray-700 z-10 transition-all duration-200"
              style={{
                left: `${boatX}%`,
                top: "0",
                height: `${hookY}%`,
              }}
            />
          )}

          {/* Hook */}
          {(isCasting || isReeling || hookY > 0) && (
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-200"
              style={{
                left: `${boatX}%`,
                top: `${hookY}%`,
              }}
            >
              <Anchor className="h-6 w-6 text-gray-700" />
            </div>
          )}

          {/* Caught Fish */}
          {caughtFish && isReeling && (
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-200"
              style={{
                left: `${boatX}%`,
                top: `${hookY}%`,
                color: caughtFish.color,
                fontSize: `${fishSizes[caughtFish.size].width}px`,
              }}
            >
              <FishIcon className="animate-bounce" />
            </div>
          )}

          {/* Fish and Sharks */}
          {fish.map((f) => {
               if (caughtFish?.id === f.id) return null;
               const size =  fishSizes[f.size].width;
                return (
                    <div
                        key={f.id}
                        className="absolute transition-all duration-100"
                        style={{
                         left: `${f.x}%`,
                          top: `${f.y}%`,
                          color: f.color,
                        }}
                        // puts the image ove the f object
                    >
                      <img
                          src={f.image}
                          alt="fish"
                          className="w-full h-full object-contain" // this makes tailwind css classes - for look purposes
                          style={{
                            transform: `scaleX(${f.direction})`,
                            width: `${size}px`,
                          }}
                      />
                    </div>
                );
              })}
          {/* Seaweed */}
          {coral.map((c) => (
            <div
              key={c.id}
              className="absolute bottom-0 transition-all duration-100"
              style={{
                left: `${c.x}%`,
                height: `${c.height}px`,
                width: "64px",
              }}
            >
              <img 
                src={c.seaweedType} 
                alt="seaweed" 
                className="w-full h-full object-contain object-bottom"
              />
            </div>
          ))}

          {/* Ocean floor */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-900/50 to-transparent" />
        </div>
      </Card>

      <p className="mt-4 text-sm text-muted-foreground text-center max-w-md">
        Use your arrow keys or buttons to move the boat! 
        Cast your line to catch fish and earn points!
      </p>
    </div>
  );
};
export default FishingGame;