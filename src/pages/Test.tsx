import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const SNELLEN_LETTERS = ["C", "D", "E", "F", "H", "K", "N", "O", "P", "R", "T", "U", "V", "Z", "L"];
const TOTAL_TESTS = 8;

// Font sizes for digital test at 40-80 cm distance (in rem)
const FONT_SIZES = [1.8, 1.5, 1.25, 1.05, 0.88, 0.74, 0.62, 0.52];

type EyeResults = {
  score: number;
  total: number;
  correctAnswers: string[];
};

const Test = () => {
  const navigate = useNavigate();
  const [eyeToTest, setEyeToTest] = useState<"right" | "left" | null>(null);
  const [currentTest, setCurrentTest] = useState(0);
  const [currentLetter, setCurrentLetter] = useState("");
  const [previousLetter, setPreviousLetter] = useState("");
  const [userInput, setUserInput] = useState("");
  const [fontSize, setFontSize] = useState(FONT_SIZES[0]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [correctAnswersDetails, setCorrectAnswersDetails] = useState<string[]>([]);
  const [visionResults, setVisionResults] = useState<{
    rightEye: EyeResults | null;
    leftEye: EyeResults | null;
  }>({
    rightEye: null,
    leftEye: null
  });

  useEffect(() => {
    generateNewLetter();
  }, [currentTest]);

  const generateNewLetter = () => {
    let randomLetter;
    do {
      randomLetter = SNELLEN_LETTERS[Math.floor(Math.random() * SNELLEN_LETTERS.length)];
    } while (randomLetter === previousLetter && SNELLEN_LETTERS.length > 1);
    
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
  };

  const handleNext = () => {
    const isCorrect = userInput.toUpperCase() === currentLetter;
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setCorrectAnswersDetails(prev => [...prev, currentLetter]);
      toast.success("¡Correcto!");
    } else {
      toast.error(`Incorrecto. La letra era ${currentLetter}`);
    }

    if (currentTest < TOTAL_TESTS - 1) {
      setCurrentTest(prev => prev + 1);
    } else {
      // Calculate final score for current eye
      const finalScore = correctAnswers + (isCorrect ? 1 : 0);
      const finalCorrectAnswers = isCorrect ? [...correctAnswersDetails, currentLetter] : correctAnswersDetails;
      
      const currentEyeResults: EyeResults = {
        score: finalScore,
        total: TOTAL_TESTS,
        correctAnswers: finalCorrectAnswers
      };

      if (eyeToTest === "right") {
        // Save right eye results and start left eye test
        setVisionResults(prev => ({ ...prev, rightEye: currentEyeResults }));
        toast.success("Ojo derecho completado. Ahora prueba el ojo izquierdo.");
        startEyeTest("left");
      } else if (eyeToTest === "left") {
        // Save left eye results and navigate to questionnaire
        const finalResults = {
          rightEye: visionResults.rightEye!,
          leftEye: currentEyeResults
        };
        navigate("/lifestyle-questionnaire", { 
          state: { 
            rightEye: finalResults.rightEye,
            leftEye: finalResults.leftEye
          } 
        });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userInput.trim()) {
      handleNext();
    }
  };

  const progress = ((currentTest + 1) / TOTAL_TESTS) * 100;

  // Eye selection screen
  if (!eyeToTest) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Selecciona el ojo a evaluar</h2>
            <p className="text-muted-foreground">
              Realizarás la prueba para cada ojo por separado. Cubre un ojo mientras evalúas el otro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button
              size="lg"
              onClick={() => startEyeTest("right")}
              className="h-32 text-xl flex flex-col gap-2"
            >
              <span className="text-4xl">👁️</span>
              <span>Ojo Derecho</span>
            </Button>
            <Button
              size="lg"
              onClick={() => startEyeTest("left")}
              className="h-32 text-xl flex flex-col gap-2"
            >
              <span className="text-4xl">👁️</span>
              <span>Ojo Izquierdo</span>
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Cubrirás el otro ojo durante la prueba
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

        <div className="bg-card rounded-2xl shadow-lg p-12 border border-border">
          <div className="text-center space-y-12">
            <div className="min-h-[300px] flex items-center justify-center">
              <p 
                className="font-bold text-foreground select-none"
                style={{ fontSize: `${fontSize}rem`, lineHeight: 1.2 }}
              >
                {currentLetter}
              </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div>
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
              </div>

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

        <p className="text-center text-sm text-muted-foreground">
          {eyeToTest === "right" 
            ? "Cubre tu ojo izquierdo e identifica cada letra con tu ojo derecho"
            : "Cubre tu ojo derecho e identifica cada letra con tu ojo izquierdo"
          }
        </p>
      </div>
    </div>
  );
};

export default Test;