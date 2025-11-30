import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Eye } from "lucide-react";
import { toast } from "sonner";

type EyeResults = {
  score: number;
  total: number;
  correctAnswers: string[];
};

type LocationState = {
  rightEye: EyeResults;
  leftEye: EyeResults;
};

type Stage = "diagnostic" | "questionnaire" | "lifestyle";

const INITIAL_LIFESTYLE_ANSWERS = {
  age: "",
  screenTime: "",
  wearGlasses: "",
  familyMyopia: "",
  attentionCheck: "",
  eyeStrain: "",
  eyeRest: "",
  sleep: "",
  outdoorTime: "",
  readingDistance: ""
};

type LifestyleAnswers = typeof INITIAL_LIFESTYLE_ANSWERS;

type QuestionOption = { value: string; label: string };
type QuestionConfig = {
  id: string;
  question: string;
  options: QuestionOption[];
};

type QuestionBlockProps = {
  index: number;
  question: QuestionConfig;
  value: string;
  onChange: (value: string) => void;
};

const QuestionBlock = ({ index, question, value, onChange }: QuestionBlockProps) => (
  <div className="space-y-4">
    <Label className="text-base font-semibold text-foreground">
      {index + 1}. {question.question}
    </Label>
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className="space-y-3"
    >
      {question.options.map((option) => (
        <div key={option.value} className="flex items-center space-x-3">
          <RadioGroupItem
            value={option.value}
            id={`${question.id}-${option.value}`}
          />
          <Label
            htmlFor={`${question.id}-${option.value}`}
            className="font-normal cursor-pointer"
          >
            {option.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  </div>
);

const LifestyleQuestionnaire = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const rightEye = state?.rightEye;
  const leftEye = state?.leftEye;

  const [diagnosedMyopia, setDiagnosedMyopia] = useState("");
  const [currentStage, setCurrentStage] = useState<Stage>("diagnostic");
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<
    Record<string, string>
  >({});
  const [lifestyleAnswers, setLifestyleAnswers] =
    useState<LifestyleAnswers>(INITIAL_LIFESTYLE_ANSWERS);
  const [prevDiagnosis, setPrevDiagnosis] = useState<string | null>(null);
  const [hasVisitedLifestyle, setHasVisitedLifestyle] = useState(false);


  // Si no vienen resultados de ojos, regresamos al test
  useEffect(() => {
    if (!rightEye || !leftEye) {
      navigate("/test", { replace: true });
    }
  }, [rightEye, leftEye, navigate]);

  if (!rightEye || !leftEye) {
    return null;
  }

  // ----------------------------
  // DEFINICIÓN DE CUESTIONARIOS
  // ----------------------------

  const questionnaireA: QuestionConfig[] = [
    {
      id: "myopiaProgression",
      question: "¿Has notado que tu miopía ha empeorado en los últimos 2 años?",
      options: [
        { value: "yes", label: "Sí" },
        { value: "no", label: "No" },
        { value: "unsure", label: "No estoy seguro" }
      ]
    },
    {
      id: "glassesUpdate",
      question: "¿Con qué frecuencia actualizas tus gafas o lentes de contacto?",
      options: [
        { value: "yearly", label: "Cada año o menos" },
        { value: "2-3years", label: "Cada 2-3 años" },
        { value: "rarely", label: "Raramente o casi nunca" }
      ]
    },
    {
      id: "visionChanges",
      question: "¿Experimentas visión borrosa incluso con tus gafas/lentes actuales?",
      options: [
        { value: "frequently", label: "Frecuentemente" },
        { value: "sometimes", label: "A veces" },
        { value: "never", label: "Nunca" },
      ]
    },
    {
      id: "nightVision",
      question: "¿Tienes dificultad para ver de noche o con poca luz?",
      options: [
        { value: "yes", label: "Sí" },
        { value: "sometimes", label: "A veces" },
        { value: "no", label: "No" }
      ]
    },
    {
      id: "distanceVision",
      question: "¿A qué distancia puedes reconocer rostros familiares sin gafas?",
      options: [
        { value: "close", label: "Menos de 2 metros" },
        { value: "medium", label: "2-5 metros" },
        { value: "far", label: "Más de 5 metros" }
      ]
    }
  ];

  const questionnaireB: QuestionConfig[] = [
    {
      id: "distanceBlur",
      question: "¿Tienes dificultad para ver objetos lejanos (letreros, pizarra)?",
      options: [
        { value: "frequently", label: "Frecuentemente" },
        { value: "sometimes", label: "A veces" },
        { value: "never", label: "Nunca" }
      ]
    },
    {
      id: "eyeSquinting",
      question: "¿Entrecierras los ojos para ver mejor de lejos?",
      options: [
        { value: "frequently", label: "Frecuentemente" },
        { value: "sometimes", label: "A veces" },
        { value: "never", label: "Nunca" }
      ]
    },
    {
      id: "headaches",
      question: "¿Experimentas dolores de cabeza después de actividades visuales prolongadas?",
      options: [
        { value: "frequently", label: "Frecuentemente" },
        { value: "sometimes", label: "A veces" },
        { value: "never", label: "Nunca" }
      ]
    },
    {
      id: "closeWork",
      question: "¿Ves con claridad al leer o trabajar de cerca?",
      options: [
        { value: "yes", label: "Sí, sin problemas" },
        { value: "sometimes", label: "A veces borroso" },
        { value: "no", label: "Frecuentemente borroso" }
      ]
    },
    {
      id: "visionFatigue",
      question: "¿Sientes que tu visión se cansa o empeora al final del día?",
      options: [
        { value: "yes", label: "Sí" },
        { value: "sometimes", label: "A veces" },
        { value: "no", label: "No" }
      ]
    }
  ];

  const lifestyleQuestions: QuestionConfig[] = [
    {
      id: "age",
      question: "¿Cuál es tu edad?",
      options: [
        { value: "under18", label: "Menos de 18 años" },
        { value: "18-30", label: "18–30 años" },
        { value: "31-45", label: "31–45 años" },
        { value: "over45", label: "Más de 45 años" }
      ]
    },
    {
      id: "screenTime",
      question: "¿Cuántas horas al día pasas frente a una pantalla?",
      options: [
        { value: "low", label: "Menos de 2 horas" },
        { value: "medium", label: "2-6 horas" },
        { value: "high", label: "Más de 6 horas" }
      ]
    },
    {
      id: "wearGlasses",
      question: "¿Usas gafas o lentes de contacto?",
      options: [
        { value: "yes", label: "Sí" },
        { value: "no", label: "No" }
      ]
    },
    {
      id: "familyMyopia",
      question: "¿Algún miembro de tu familia (padres o hermanos) tiene miopía?",
      options: [
        { value: "yes", label: "Sí" },
        { value: "no", label: "No" },
        { value: "unsure", label: "No estoy seguro" }
      ]
    },
    {
      id: "attentionCheck",
      question: "Para asegurar que estás prestando atención, selecciona la opción 'A veces'.",
      options: [
        { value: "frequently", label: "Frecuentemente" },
        { value: "sometimes", label: "A veces" },
        { value: "never", label: "Nunca" }
      ]
    },
    {
      id: "eyeStrain",
      question: "¿Con qué frecuencia experimentas fatiga ocular o dolores de cabeza?",
      options: [
        { value: "often", label: "Frecuentemente" },
        { value: "sometimes", label: "A veces" },
        { value: "never", label: "Nunca" }
      ]
    },
    {
      id: "eyeRest",
      question: "¿Con qué frecuencia parpadeas conscientemente o descansas tus ojos?",
      options: [
        { value: "frequently", label: "Frecuentemente" },
        { value: "sometimes", label: "A veces" },
        { value: "never", label: "Nunca" }
      ]
    },
    {
      id: "sleep",
      question: "¿Cuántas horas duermes diariamente?",
      options: [
        { value: "low", label: "Menos de 6 horas" },
        { value: "medium", label: "6-8 horas" },
        { value: "high", label: "Más de 8 horas" }
      ]
    },
    {
      id: "outdoorTime",
      question: "¿Cuánto tiempo pasas al aire libre diariamente?",
      options: [
        { value: "low", label: "Menos de 30 minutos" },
        { value: "medium", label: "30 minutos - 2 horas" },
        { value: "high", label: "Más de 2 horas" }
      ]
    },
    {
      id: "readingDistance",
      question: "¿A qué distancia mantienes tu teléfono o libro al leer?",
      options: [
        { value: "close", label: "Muy cerca (< 20 cm)" },
        { value: "normal", label: "Distancia normal (20-40 cm)" },
        { value: "far", label: "Lejos (> 40 cm)" }
      ]
    }
  ];

  // ----------------------------------
  // HANDLERS / LÓGICA DE NAVEGACIÓN
  // ----------------------------------

  const currentQuestionnaire =
    diagnosedMyopia === "yes" ? questionnaireA : questionnaireB;

  const isQuestionnaireComplete = currentQuestionnaire.every(
    (q) => questionnaireAnswers[q.id] && questionnaireAnswers[q.id] !== ""
  );

  const isLifestyleComplete = Object.values(lifestyleAnswers).every(
    (answer) => answer !== ""
  );

  useEffect(() => {
    if (prevDiagnosis !== null && prevDiagnosis !== diagnosedMyopia) {
      setQuestionnaireAnswers({});
    }
    setPrevDiagnosis(diagnosedMyopia);
  }, [diagnosedMyopia]);

  const handleDiagnosticSubmit = () => {
    if (!diagnosedMyopia) return;
    setCurrentStage("questionnaire");
  };

  const handleQuestionnaireAnswerChange = (
    questionId: string,
    value: string
  ) => {
    setQuestionnaireAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleLifestyleAnswerChange = (
    questionId: string,
    value: string
  ) => {
    setLifestyleAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleQuestionnaireSubmit = () => {
    if (!isQuestionnaireComplete) return;

    if (!hasVisitedLifestyle) {
      setLifestyleAnswers(INITIAL_LIFESTYLE_ANSWERS);
    }

    setHasVisitedLifestyle(true);
    setCurrentStage("lifestyle");
  };

  const handleFinalSubmit = () => {
    if (!isLifestyleComplete) return;

    if (lifestyleAnswers.attentionCheck !== "sometimes") {
      toast.error("Por favor selecciona 'A veces' en la pregunta de atención.");
      return;
    }

    const finalAnswers = {
      diagnosedMyopia,
      rightEyeScore: rightEye.score,
      leftEyeScore: leftEye.score,
      rightEyeTotal: rightEye.total,
      leftEyeTotal: leftEye.total,
      ...questionnaireAnswers,
      ...lifestyleAnswers
    };

    navigate("/final-results", {
      state: {
        answers: finalAnswers,
        rightEye,
        leftEye
      }
    });
  };

  // ----------------------------
  // VISTAS POR ETAPA
  // ----------------------------

  if (currentStage === "diagnostic") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-medical-light/20 to-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8 animate-in fade-in duration-700">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
              <Eye className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-4xl font-bold text-foreground">
              Evaluación Visual Personalizada
            </h2>
            <p className="text-lg text-muted-foreground">
              Comenzamos con una pregunta importante
            </p>
          </div>

          <Card className="p-8 space-y-6">
            <Label className="text-xl font-semibold text-foreground">
              ¿Tienes diagnóstico de miopía?
            </Label>
            <RadioGroup
              value={diagnosedMyopia}
              onValueChange={setDiagnosedMyopia}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="yes" id="diagnosed-yes" />
                <Label
                  htmlFor="diagnosed-yes"
                  className="font-normal cursor-pointer text-base"
                >
                  Sí, tengo diagnóstico de miopía
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="no" id="diagnosed-no" />
                <Label
                  htmlFor="diagnosed-no"
                  className="font-normal cursor-pointer text-base"
                >
                  No tengo diagnóstico
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="unsure" id="diagnosed-unsure" />
                <Label
                  htmlFor="diagnosed-unsure"
                  className="font-normal cursor-pointer text-base"
                >
                  No estoy seguro
                </Label>
              </div>
            </RadioGroup>
          </Card>

          <Button
            size="lg"
            onClick={handleDiagnosticSubmit}
            disabled={!diagnosedMyopia}
            className="w-full h-auto py-4"
          >
            Continuar
          </Button>
        </div>
      </div>
    );
  }

  if (currentStage === "questionnaire") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-medical-light/20 to-background flex items-center justify-center p-4">
        <div className="max-w-3xl w-full space-y-8 animate-in fade-in duration-700">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
              <Eye className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-4xl font-bold text-foreground">
              {diagnosedMyopia === "yes"
                ? "Cuestionario A: Evaluación de Miopía"
                : "Cuestionario B: Detección Visual"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {diagnosedMyopia === "yes"
                ? "Evaluación específica para personas con miopía diagnosticada"
                : "Evaluación de síntomas visuales"}
            </p>
          </div>

          <Card className="p-8 space-y-8">
            {currentQuestionnaire.map((question, index) => (
              <QuestionBlock
                key={question.id}
                index={index}
                question={question}
                value={questionnaireAnswers[question.id] || ""}
                onChange={(value) =>
                  handleQuestionnaireAnswerChange(question.id, value)
                }
              />
            ))}
          </Card>

          <div className="flex flex-col gap-4">
            <Button
              size="lg"
              onClick={handleQuestionnaireSubmit}
              disabled={!isQuestionnaireComplete}
              className="w-full h-auto py-4"
            >
              Continuar a Hábitos de Vida
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setCurrentStage("diagnostic");
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Volver
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Lifestyle
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-medical-light/20 to-background flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8 animate-in fade-in duration-700">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
            <Eye className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-4xl font-bold text-foreground">
            Hábitos Visuales y Estilo de Vida
          </h2>
          <p className="text-lg text-muted-foreground">
            Responde estas preguntas para una evaluación más precisa
          </p>
        </div>

        <Card className="p-8 space-y-8">
          {lifestyleQuestions.map((question, index) => (
            <QuestionBlock
              key={question.id}
              index={index}
              question={question}
              value={
                lifestyleAnswers[
                  question.id as keyof LifestyleAnswers
                ] as string
              }
              onChange={(value) =>
                handleLifestyleAnswerChange(question.id, value)
              }
            />
          ))}
        </Card>

        <div className="flex flex-col gap-4">
          <Button
            size="lg"
            onClick={handleFinalSubmit}
            disabled={!isLifestyleComplete}
            className="w-full h-auto py-4"
          >
            Enviar y ver análisis IA
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setCurrentStage("questionnaire");
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            Volver
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LifestyleQuestionnaire;