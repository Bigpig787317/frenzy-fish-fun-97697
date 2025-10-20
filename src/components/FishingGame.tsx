import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Fish as FishIcon, Anchor, Cloud } from "lucide-react";
import seaweedGreenA from "@/assets/seaweed_green_a.svg";
import seaweedGrass from "@/assets/seaweed_grass.svg";
import seaweedGreenC from "@/assets/seaweed_green_c.svg";
import seaweedPink from "@/assets/seaweed_pink.svg";
import seaweedOrange from "@/assets/seaweed_orange.svg";

interface Fish {
  id: number;
  x: number;
  y: number;
  size: "small" | "medium" | "large";
  speed: number;
  direction: 1 | -1;
  color: string;
  isShark?: boolean;
}

interface Coral {
  id: number;
  x: number;
  height: number;
  seaweedType: string;
}

export const FishingGame = () => {
  const [score, setScore] = useState(0);
  const [baitNo, setBaitNo] = useState(5);
  // bait
  // question asker
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [hookY, setHookY] = useState(0);
  const [boatX, setBoatX] = useState(50); // Boat position (percentage)
  const [isCasting, setIsCasting] = useState(false);
  const [isReeling, setIsReeling] = useState(false);
  const [fish, setFish] = useState<Fish[]>([]);
  const [coral, setCoral] = useState<Coral[]>([]);
  const [caughtFish, setCaughtFish] = useState<Fish | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const hookSpeed = 3;

  const fishColors = ["hsl(var(--fish-orange))", "hsl(var(--fish-yellow))", "hsl(var(--coral))"];
  const fishSizes = {
    small: { width: 35, height: 20, points: 10 },
    medium: { width: 50, height: 35, points: 25 },
    large: { width: 70, height: 50, points: 50 },
    shark: { width: 80, height: 60, points: 100 },
  };

  // Keyboard controls for boat movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setBoatX((prev) => Math.max(10, prev - 2));
      } else if (e.key === "ArrowRight") {
        setBoatX((prev) => Math.min(90, prev + 2));
      } else if (e.key == "ArrowDown") {
        handleCast();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Initialize seaweed
  const seaweedTypes = [seaweedGreenA, seaweedGrass, seaweedGreenC, seaweedPink, seaweedOrange];
  
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
    const initialFish: Fish[] = Array.from({ length: 10 }, (_, i) => {
      const isShark = i < 2; // First 2 are sharks
      return {
        id: i,
        x: Math.random() * 100,
        y: 20 + Math.random() * 70,
        size: isShark ? "large" : Math.random() > 0.6 ? "large" : Math.random() > 0.4 ? "medium" : "small",
        speed: isShark ? 0.2 + Math.random() * 0.2 : 0.1 + Math.random() * 0.3,
        direction: Math.random() > 0.5 ? 1 : -1,
        color: isShark ? "hsl(200, 10%, 30%)" : fishColors[Math.floor(Math.random() * fishColors.length)],
        isShark,
      };
    });
    setFish(initialFish);
  }, []);

  // Animate fish
  useEffect(() => {
    const interval = setInterval(() => {
      setFish((prevFish) =>
        prevFish.map((f) => {
          let newX = f.x + f.speed * f.direction;
          let newDirection = f.direction;

          if (newX > 100) {
            newX = 100;
            newDirection = -1;
          } else if (newX < 0) {
            newX = 0;
            newDirection = 1;
          }

          return { ...f, x: newX, direction: newDirection };
        })
      );
    }, 50);

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
              const points = caughtFish.isShark ? fishSizes.shark.points : fishSizes[caughtFish.size].points;
              setScore((s) => s + points);
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
                  isShark: isNewShark,
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
    const catchRadius = 5;

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
  const question = "what is 9+10?";
  const correctAnswer = "21";

  // coppied from chat didn't have enough time
  const handleSubmitAnswer = () => {
    if (currentAnswer === correctAnswer) {
      setBaitNo(prev => prev + 1); // Reward: add 1 bait
      alert("Correct!");
    } else {
      alert("Try again!");
    }
    setCurrentAnswer("");      // Clear the input for next time
    setShowQuestion(false);    // Hide the question modal
  };
// coppied from chat
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions

  <Button onClick={() => setShowQuestion(true)}>
    Refill Bait
  </Button>
      //setBaitNo(prev => prev + 1)}>
    //Refill Bait (+1) come back
  //</Button>


  const handleReset = () => {
    setScore(0);
    setHookY(0);
    setBoatX(50);
    setIsCasting(false);
    setIsReeling(false);
    setCaughtFish(null);

  };

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
            <div className="bg-white p-6 rounded shadow-lg flex flex-col gap-4">
              <p>{question}</p>
              <input
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  className="border p-1"
              />
              <div className="flex gap-2">
                <Button onClick={handleSubmitAnswer}>Submit</Button>
                <Button onClick={() => setShowQuestion(false)}>Cancel</Button>
              </div>
            </div>
          </div>
      )}
      <Card className="p-6 mb-4 bg-white/90 backdrop-blur shadow-lg">
        <div className="flex items-center justify-between gap-8">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Score</p>
            <p className="text-3xl font-bold text-primary">{score}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleReset} variant="outline">
              Reset
            </Button>
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
                fontSize: `${caughtFish.isShark ? fishSizes.shark.width : fishSizes[caughtFish.size].width}px`,
              }}
            >
              <FishIcon className="animate-bounce" />
            </div>
          )}

          {/* Fish and Sharks */}
          {fish.map((f) => {
            if (caughtFish?.id === f.id) return null;
            const size = f.isShark ? fishSizes.shark.width : fishSizes[f.size].width;
            return (
              <div
                key={f.id}
                className="absolute transition-all duration-100"
                style={{
                  left: `${f.x}%`,
                  top: `${f.y}%`,
                  color: f.color,
                  transform: `scaleX(${f.direction})`,
                  fontSize: `${size}px`,
                }}
              >
                <FishIcon className={f.isShark ? "stroke-2" : ""} />
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
        Use arrow keys or buttons to move the boat! Cast your line to catch fish (10-50 pts) and sharks (100 pts)!
      </p>
    </div>
  );
};
