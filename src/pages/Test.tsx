import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const SNELLEN_LETTERS = ["C", "D", "E", "F", "H", "K", "N", "O", "P", "R", "T", "U", "V", "Z", "L"];
const TOTAL_TESTS = 8;

// Font sizes for digital test (40-80 cm)
const FONT_SIZES = [1.8, 1.5, 1.25, 1.05, 0.88, 0.74, 0.62, 0.52];

type EyeResults = {
  score: number;
  total: number;
  correctAnswers: string[];
};

const Test = () => {
  const navigate = useNavigate();
  const [eyeToTest, setEyeToTest] = useState<"right" | "left" | null>(null);
  const [isPreparing, setIsPreparing] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [currentTest, setCurrentTest] = useState(0);
  const [currentLetter, setCurrentLetter] = useState("");
  const [previousLetter, setPreviousLetter] = useState("");
  const [userInput, setUserInput] = useState("");
  const [fontSize, setFontSize] = useState(FONT_SIZES[0]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [transitionScreen, setTransitionScreen] = useState(false);
  const [correctAnswersDetails, setCorrectAnswersDetails] = useState<string[]>([]);
  const [visionResults, setVisionResults] = useState<{
    rightEye: EyeResults | null;
    leftEye: EyeResults | null;
  }>({
    rightEye: null,
    leftEye: null
  });

  // Countdown timer for preparation
  useEffect(() => {
    if (!isPreparing) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(interval);
          setIsPreparing(false);
          startEyeTest("right");
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPreparing]);

  // Generate new letter each round
  useEffect(() => {
    generateNewLetter();
  }, [currentTest]);

  const generateNewLetter = () => {
    let randomLetter = "";
    do {
      randomLetter = SNELLEN_LETTERS[Math.floor(Math.random() * SNELLEN_LETTERS.length)];
    } while (randomLetter === previousLetter);

    setCurrentLetter(randomLetter);
    setPreviousLetter(randomLetter);
    setFontSize(FONT_SIZES[currentTest] || FONT_SIZES[FONT_SIZES.length - 1]);
    setUserInput("");
  };

  const startEyeTest = (eye: "right" | "left") => {
    setEyeToTest(eye);
    setCurrentTest(0);
    setCorrectAnswers(0);
    setCorrectAnswersDetails([]);
    setPreviousLetter("");
  };

  const handleNext = () => {
    // Remove any existing toast notifications
    toast.dismiss();

    const isCorrect = userInput.toUpperCase() === currentLetter;

    // Actualizar respuestas locales
    const newCorrectAnswers = correctAnswers + (isCorrect ? 1 : 0);
    const newCorrectDetails = isCorrect
      ? [...correctAnswersDetails, currentLetter]
      : [...correctAnswersDetails];

    if (isCorrect) {
      toast.success("¡Correcto!");
    } else {
      toast.error(`Incorrecto. La letra era ${currentLetter}`);
    }

    const currentEyeResults: EyeResults = {
      score: newCorrectAnswers,
      total: TOTAL_TESTS,
      correctAnswers: newCorrectDetails
    };

    // If there are more tests in the current eye
    if (currentTest < TOTAL_TESTS - 1) {
      setCorrectAnswers(newCorrectAnswers);
      setCorrectAnswersDetails(newCorrectDetails);
      setCurrentTest(prev => prev + 1);
      return;
    }

    // If terminates the right eye
    if (eyeToTest === "right") {
      setVisionResults(prev => ({ ...prev, rightEye: currentEyeResults }));

      setTransitionScreen(true);

      setTimeout(() => {
        setTransitionScreen(false);
        startEyeTest("left");
      }, 5000);

      return;
    }

    // If terminates the left eye
    if (eyeToTest === "left") {
      const finalResults = {
        rightEye: visionResults.rightEye || null,
        leftEye: currentEyeResults
      };

      navigate("/lifestyle-questionnaire", {
        state: {
          rightEye: finalResults.rightEye,
          leftEye: finalResults.leftEye
        }
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userInput.trim()) handleNext();
  };

  const progress = ((currentTest + 1) / TOTAL_TESTS) * 100;

  if (isPreparing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-8 max-w-xl animate-in fade-in duration-500">

          <h2 className="text-4xl font-bold text-foreground">
            Preparación para la Prueba de Visión
          </h2>

          <p className="text-lg text-muted-foreground">
            Comenzaremos evaluando tu <span className="font-semibold text-foreground">Ojo Derecho</span>.
          </p>

          <p className="text-xl text-foreground font-medium">
            Cubre tu ojo izquierdo y prepárate para identificar las letras.
          </p>

          <div className="pt-4">
            <p className="text-5xl font-bold text-primary animate-pulse">
              {countdown}
            </p>
          </div>

        </div>
      </div>
    );
  }

  if (transitionScreen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">

          <h2 className="text-3xl font-bold text-foreground">
            Evaluación del Ojo Derecho Completada
          </h2>

          <p className="text-muted-foreground text-lg">
            Ahora cubre tu ojo derecho para continuar con la evaluación.
          </p>

          <p className="text-lg font-medium text-foreground">
            Continuaremos con la prueba del Ojo Izquierdo.
          </p>

          <div className="flex justify-center pt-6">
            <div className="h-12 w-12 border-4 border-primary/40 border-t-primary rounded-full animate-spin" />
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Preparando la evaluación...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              Prueba de Visión - {eyeToTest === "right" ? "Ojo Derecho" : "Ojo Izquierdo"}
            </h2>
            <span className="text-sm text-muted-foreground">
              Pregunta {currentTest + 1} de {TOTAL_TESTS}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {eyeToTest === "right"
            ? "Cubre tu ojo izquierdo e identifica cada letra con tu OJO DERECHO"
            : "Cubre tu ojo derecho e identifica cada letra con tu OJO IZQUIERDO"}
        </p>

        <div className="bg-card rounded-2xl shadow-md p-8 border border-border">
          <div className="text-center space-y-12">
            <div className="min-h-[220px] flex items-center justify-center">
              <p className="font-bold text-foreground select-none" style={{ fontSize: `${fontSize}rem`, lineHeight: 1.2 }}>
                {currentLetter}
              </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Ingresa la letra que ves:
              </label>
              <Input
                type="text"
                maxLength={1}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe la letra aquí"
                className="text-center text-2xl h-14 uppercase"
                autoFocus
              />
              <Button
                size="lg"
                onClick={handleNext}
                disabled={!userInput.trim()}
                className="w-full text-lg py-6 h-auto"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;