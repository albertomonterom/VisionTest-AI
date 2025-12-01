import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertTriangle, Download, Brain } from "lucide-react";
import { toast } from "sonner";
import { FeedbackModal } from "@/components/FeedbackModal";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";

const HeuristicResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { answers, rightEye, leftEye } = location.state || {};

  const [isSaving, setIsSaving] = useState(false);
  const [savedToDb, setSavedToDb] = useState(false);
  const [realDiagnosis, setRealDiagnosis] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [visionRecordId, setVisionRecordId] = useState<string | null>(null);

  // Helper function to calculate vision level from percentage
  const calculateVisionMetrics = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    let visionLevel = "6/6";
    let visionRecommendation = "";
    let severity: "good" | "moderate" | "poor" = "good";

    if (percentage >= 87.5) {
      visionLevel = "6/6";
      visionRecommendation = "¡Visión excelente! No se detectaron problemas.";
      severity = "good";
    } else if (percentage >= 75) {
      visionLevel = "6/9";
      visionRecommendation = "Buena visión con problemas menores de claridad.";
      severity = "good";
    } else if (percentage >= 62.5) {
      visionLevel = "6/12";
      visionRecommendation = "Posible miopía leve detectada.";
      severity = "moderate";
    } else if (percentage >= 50) {
      visionLevel = "6/18";
      visionRecommendation = "Deterioro moderado de la visión detectado.";
      severity = "moderate";
    } else {
      visionLevel = "6/24 o menos";
      visionRecommendation = "Deterioro significativo de la visión detectado.";
      severity = "poor";
    }

    return { percentage, visionLevel, visionRecommendation, severity };
  };

  // Calculate metrics for both eyes
  const rightEyeMetrics = rightEye ? calculateVisionMetrics(rightEye.score, rightEye.total) : null;
  const leftEyeMetrics = leftEye ? calculateVisionMetrics(leftEye.score, leftEye.total) : null;

  // Calculate average for overall assessment
  const avgScore = rightEye && leftEye ? (rightEye.score + leftEye.score) / 2 : 0;
  const avgTotal = rightEye && leftEye ? (rightEye.total + leftEye.total) / 2 : 8;
  const overallMetrics = calculateVisionMetrics(avgScore, avgTotal);
  
  // Determine worst eye for severity
  const worstSeverity = 
    rightEyeMetrics && leftEyeMetrics 
      ? (rightEyeMetrics.severity === "poor" || leftEyeMetrics.severity === "poor" 
          ? "poor" 
          : rightEyeMetrics.severity === "moderate" || leftEyeMetrics.severity === "moderate" 
            ? "moderate" 
            : "good")
      : "good";
  
  const severity = worstSeverity;

  // Calculate AI prediction based on vision test and lifestyle answers
  const calculateAIPrediction = () => {
    if (!answers || !rightEyeMetrics || !leftEyeMetrics) return null;

    // Use the worse eye's percentage for AI prediction
    const worsePercentage = Math.min(rightEyeMetrics.percentage, leftEyeMetrics.percentage);
    let baseProb = 100 - worsePercentage;
    
    // Check attention control
    const attentionCheckFailed = answers.attentionCheck !== "sometimes";
    
    // Adjust probability based on lifestyle factors
    if (answers.screenTime === "high") baseProb += 15;
    if (answers.screenTime === "medium") baseProb += 8;
    
    if (answers.eyeStrain === "often") baseProb += 12;
    if (answers.eyeStrain === "sometimes") baseProb += 6;
    
    if (answers.eyeRest === "never") baseProb += 10;
    if (answers.eyeRest === "sometimes") baseProb += 5;
    
    if (answers.sleep === "low") baseProb += 8;
    
    if (answers.outdoorTime === "low") baseProb += 10;
    if (answers.outdoorTime === "medium") baseProb += 5;
    
    if (answers.readingDistance === "close") baseProb += 12;
    if (answers.readingDistance === "normal") baseProb += 4;
    
    if (answers.familyMyopia === "yes") baseProb += 15;
    
    // Cap probability at 95%
    const finalProb = Math.min(95, Math.max(5, baseProb));
    
    // Determine condition and severity
    let condition = "";
    let aiSeverity: "low" | "moderate" | "high" = "low";
    let aiRecommendation = "";
    
    if (finalProb < 30) {
      condition = "visión saludable";
      aiSeverity = "low";
      aiRecommendation = "Mantén tus buenos hábitos visuales y continúa con revisiones regulares cada 1-2 años.";
    } else if (finalProb < 50) {
      condition = "miopía leve";
      aiSeverity = "low";
      aiRecommendation = "Reduce el tiempo de pantalla y toma descansos frecuentes. Programa un examen de la vista en los próximos 6 meses.";
    } else if (finalProb < 70) {
      condition = "miopía moderada";
      aiSeverity = "moderate";
      aiRecommendation = "Se recomienda encarecidamente un examen de la vista en las próximas 4-6 semanas. Reduce el uso de pantallas y aumenta el tiempo al aire libre.";
    } else {
      condition = "miopía significativa o fatiga ocular crónica";
      aiSeverity = "high";
      aiRecommendation = "Por favor, agenda un examen completo de la vista lo antes posible. Considera reducir drásticamente el tiempo de pantalla y hacer pausas cada 20 minutos.";
    }
    
    // Add age-specific recommendations
    if (answers.age === "over45") {
      aiRecommendation += " A partir de los 40–45 años aumenta el riesgo de presbicia y otros cambios visuales relacionados con la edad.";
    }
    
    // Add attention check warning if failed
    if (attentionCheckFailed) {
      aiRecommendation += " ⚠️ Se detectó inconsistencia en las respuestas del cuestionario. Los resultados pueden ser menos precisos.";
    }
    
    // Identify key risk factors
    const factors: string[] = [];
    if (answers.screenTime === "high") factors.push("Alto tiempo de pantalla");
    if (answers.eyeStrain === "often") factors.push("Fatiga ocular frecuente");
    if (answers.eyeRest === "never") factors.push("Descanso ocular insuficiente");
    if (answers.sleep === "low") factors.push("Sueño inadecuado");
    if (answers.outdoorTime === "low") factors.push("Tiempo limitado al aire libre");
    if (answers.readingDistance === "close") factors.push("Distancia de lectura inadecuada");
    if (answers.familyMyopia === "yes") factors.push("Antecedentes familiares de miopía");
    if (answers.wearGlasses === "yes") factors.push("Usuario actual de corrección visual");
    if (attentionCheckFailed) factors.push("Respuestas inconsistentes en el cuestionario");
    
    return {
      probability: Math.round(finalProb),
      condition,
      severity: aiSeverity,
      recommendation: aiRecommendation,
      factors
    };
  };

  const aiPrediction = calculateAIPrediction();

  const saveToSupabase = async () => {
    if (!answers || !rightEye || !leftEye) return;

    setIsSaving(true);
    
    try {
      const { data, error } = await supabase.from("vision_data").insert({
        // Vision test
        right_eye_score: rightEye.score,
        right_eye_total: rightEye.total,
        left_eye_score: leftEye.score,
        left_eye_total: leftEye.total,

        // Self-reported diagnosis
        diagnosed_myopia: answers.diagnosedMyopia || null,

        // Real diagnosis (true label)
        real_diagnosis: realDiagnosis || null,

        // Questionnaire A
        myopia_progression: answers.myopiaProgression || null,
        glasses_update: answers.glassesUpdate || null,
        vision_changes: answers.visionChanges || null,
        night_vision: answers.nightVision || null,
        distance_vision: answers.distanceVision || null,

        // Questionnaire B
        distance_blur: answers.distanceBlur || null,
        eye_squinting: answers.eyeSquinting || null,
        headaches: answers.headaches || null,
        close_work: answers.closeWork || null,
        vision_fatigue: answers.visionFatigue || null,

        // Lifestyle
        age_group: answers.age || null,
        screen_time: answers.screenTime || null,
        wear_glasses: answers.wearGlasses === "yes",
        family_myopia: answers.familyMyopia || null,
        attention_check: answers.attentionCheck || null,
        eye_strain: answers.eyeStrain || null,
        eye_rest: answers.eyeRest || null,
        sleep_hours: answers.sleep || null,
        outdoor_time: answers.outdoorTime || null,
        reading_distance: answers.readingDistance || null,

        // Meta
        correct_answers: {
          right: rightEye.correctAnswers,
          left: leftEye.correctAnswers
        }
      })
      .select("id") // Get the ID of the newly inserted record
      .single(); // We expect only one record to be inserted

      if (error) throw error;

      setVisionRecordId(data?.id || null); // Store the ID for feedback
      setSavedToDb(true);
      toast.success("Resultados guardados exitosamente en la base de datos");

      setShowModal(true); // Show feedback modal after saving

    } catch (error) {
      toast.error("Error al guardar los resultados. Por favor, intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!aiPrediction || !rightEye || !leftEye || !rightEyeMetrics || !leftEyeMetrics || !overallMetrics) return;

    const doc = new jsPDF();
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.text("Reporte de Evaluación de Visión", 20, yPos);
    yPos += 15;

    // Date
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, yPos);
    yPos += 15;

    // Vision Test Results - Both Eyes
    doc.setFontSize(16);
    doc.text("Resultados de la Prueba Visual", 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.text(`Ojo Derecho: ${rightEyeMetrics.visionLevel} - ${rightEye.score}/${rightEye.total} (${rightEyeMetrics.percentage.toFixed(1)}%)`, 20, yPos);
    yPos += 8;
    doc.text(`Ojo Izquierdo: ${leftEyeMetrics.visionLevel} - ${leftEye.score}/${leftEye.total} (${leftEyeMetrics.percentage.toFixed(1)}%)`, 20, yPos);
    yPos += 8;
    doc.text(`Promedio General: ${overallMetrics.visionLevel} - ${overallMetrics.percentage.toFixed(1)}%`, 20, yPos);
    yPos += 12;

    doc.setFontSize(10);
    const visionRecLines = doc.splitTextToSize(overallMetrics.visionRecommendation, 170);
    doc.text(visionRecLines, 20, yPos);
    yPos += visionRecLines.length * 7 + 10;

    // AI Analysis
    doc.setFontSize(16);
    doc.text("Análisis Automatizado", 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.text(`Probabilidad de Problema Visual: ${aiPrediction.probability}%`, 20, yPos);
    yPos += 8;
    doc.text(`Condición Detectada: ${aiPrediction.condition}`, 20, yPos);
    yPos += 12;

    // Risk Factors
    doc.setFontSize(14);
    doc.text("Factores de Riesgo Identificados:", 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    aiPrediction.factors.forEach((factor) => {
      doc.text(`• ${factor}`, 25, yPos);
      yPos += 6;
    });
    yPos += 8;

    // AI Recommendation
    doc.setFontSize(14);
    doc.text("Recomendación Basada en Tus Respuestas:", 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    const aiRecLines = doc.splitTextToSize(aiPrediction.recommendation, 170);
    doc.text(aiRecLines, 20, yPos);
    yPos += aiRecLines.length * 7 + 10;

    // Lifestyle Answers
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.text("Respuestas del Cuestionario de Estilo de Vida", 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    const lifestyleData = [
      { label: "Edad", value: answers.age },
      { label: "Tiempo de pantalla", value: answers.screenTime },
      { label: "Usa gafas", value: answers.wearGlasses },
      { label: "Historial familiar", value: answers.familyMyopia },
      { label: "Fatiga ocular", value: answers.eyeStrain },
      { label: "Descanso ocular", value: answers.eyeRest },
      { label: "Horas de sueño", value: answers.sleep },
      { label: "Tiempo al aire libre", value: answers.outdoorTime },
      { label: "Distancia de lectura", value: answers.readingDistance },
    ];

    lifestyleData.forEach((item) => {
      doc.text(`${item.label}: ${item.value}`, 20, yPos);
      yPos += 6;
    });

    // Disclaimer
    yPos += 10;
    doc.setFontSize(8);
    const disclaimer = doc.splitTextToSize(
      "Descargo de responsabilidad: Esta herramienta está diseñada solo para fines educativos y de detección. No reemplaza un examen profesional de la vista. Por favor, consulta a un optometrista certificado para un diagnóstico preciso.",
      170
    );
    doc.text(disclaimer, 20, yPos);

    doc.save("vision-test-results.pdf");
    toast.success("PDF descargado exitosamente");
  };

  const handleTryAgain = () => {
    navigate("/welcome");
  };

  const handleFinish = () => {
    // Close the modal
    navigate("/end");
  };

  if (!aiPrediction) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando resultados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-medical-light/20 to-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8 animate-in fade-in duration-700">
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
            severity === "good" ? "bg-success/10" : 
            severity === "moderate" ? "bg-primary/10" : "bg-destructive/10"
          }`}>
            {severity === "poor" ? (
              <AlertTriangle className="w-10 h-10 text-destructive" />
            ) : (
              <CheckCircle className={`w-10 h-10 ${
                severity === "good" ? "text-success" : "text-primary"
              }`} />
            )}
          </div>
          <h2 className="text-4xl font-bold text-foreground">Evaluación Completada</h2>
          <p className="text-lg text-muted-foreground">Resultados de tu prueba de visión y análisis automatizado</p>
        </div>

        {/* Eye Comparison Card */}
        <Card className="p-6 space-y-6 border-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Comparación de Ojos</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Right Eye */}
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Ojo Derecho
                </p>
                <p className="text-4xl font-bold text-primary">{rightEyeMetrics?.visionLevel}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {rightEye?.score}/{rightEye?.total} correctas
                </p>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {rightEyeMetrics?.percentage.toFixed(1)}%
                </p>
              </div>
              <div className={`p-3 rounded-lg text-center text-xs font-medium ${
                rightEyeMetrics?.severity === "good" ? "bg-success/10 text-success" : 
                rightEyeMetrics?.severity === "moderate" ? "bg-primary/10 text-primary" : 
                "bg-destructive/10 text-destructive"
              }`}>
                {rightEyeMetrics?.severity === "good" ? "Excelente" : 
                 rightEyeMetrics?.severity === "moderate" ? "Moderado" : "Requiere Atención"}
              </div>
            </div>

            {/* Left Eye */}
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Ojo Izquierdo
                </p>
                <p className="text-4xl font-bold text-primary">{leftEyeMetrics?.visionLevel}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {leftEye?.score}/{leftEye?.total} correctas
                </p>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {leftEyeMetrics?.percentage.toFixed(1)}%
                </p>
              </div>
              <div className={`p-3 rounded-lg text-center text-xs font-medium ${
                leftEyeMetrics?.severity === "good" ? "bg-success/10 text-success" : 
                leftEyeMetrics?.severity === "moderate" ? "bg-primary/10 text-primary" : 
                "bg-destructive/10 text-destructive"
              }`}>
                {leftEyeMetrics?.severity === "good" ? "Excelente" : 
                 leftEyeMetrics?.severity === "moderate" ? "Moderado" : "Requiere Atención"}
              </div>
            </div>
          </div>

          {/* Difference Indicator */}
          {rightEyeMetrics && leftEyeMetrics && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center mb-2">Diferencia entre ojos</p>
              <div className="flex items-center justify-center gap-2">
                {Math.abs(rightEyeMetrics.percentage - leftEyeMetrics.percentage) < 10 ? (
                  <span className="text-sm font-medium text-success">✓ Balanceada ({Math.abs(rightEyeMetrics.percentage - leftEyeMetrics.percentage).toFixed(1)}%)</span>
                ) : (
                  <span className="text-sm font-medium text-destructive">⚠ Diferencia significativa ({Math.abs(rightEyeMetrics.percentage - leftEyeMetrics.percentage).toFixed(1)}%)</span>
                )}
              </div>
            </div>
          )}

          {/* Overall Recommendation */}
          <div className={`p-4 rounded-lg border-2 ${
            severity === "good" ? "bg-success/5 border-success/20" : 
            severity === "moderate" ? "bg-primary/5 border-primary/20" : 
            "bg-destructive/5 border-destructive/20"
          }`}>
            <p className="text-xs font-semibold text-foreground mb-1">Evaluación General</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{overallMetrics.visionRecommendation}</p>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-1">


          {/* AI Analysis */}
          <Card className="p-6 space-y-4 border-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-accent/10">
                <Brain className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Análisis Automatizado</h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Probabilidad de Problema Visual</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-secondary rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        aiPrediction.severity === "high" ? "bg-destructive" :
                        aiPrediction.severity === "moderate" ? "bg-primary" : "bg-success"
                      }`}
                      style={{ width: `${aiPrediction.probability}%` }}
                    />
                  </div>
                  <span className="text-2xl font-bold text-foreground min-w-[60px]">
                    {aiPrediction.probability}%
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Condición Detectada</p>
                <p className="text-lg font-semibold text-foreground capitalize">{aiPrediction.condition}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Factores de Riesgo</p>
                <div className="space-y-2">
                  {aiPrediction.factors.slice(0, 4).map((factor, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-destructive mt-0.5">•</span>
                      <span className="text-sm text-muted-foreground flex-1">{factor}</span>
                    </div>
                  ))}
                  {aiPrediction.factors.length > 4 && (
                    <p className="text-xs text-muted-foreground italic">
                      +{aiPrediction.factors.length - 4} factores más
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Unified Recommendation */}
        <Card className="p-6 border-2">
          <h3 className="text-lg font-bold text-foreground mb-3">Recomendación Basada en Tus Respuestas</h3>
          <p className="text-muted-foreground leading-relaxed">{aiPrediction.recommendation}</p>
        </Card>

        {/* Real Diagnosis Input (for future AI training) */}
        <Card className="p-6 border-2">
          <h3 className="text-lg font-bold text-foreground mb-3">Diagnóstico Real</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Si un especialista evaluó tu visión recientemente, selecciona tu diagnóstico real. 
            Esta información nos ayuda a mejorar nuestro análisis mediante IA.
          </p>

          <RadioGroup
            value={realDiagnosis ?? ""}
            onValueChange={setRealDiagnosis}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="myopia" id="diag-myopia" />
              <Label htmlFor="diag-myopia">Miopía confirmada</Label>
            </div>

            <div className="flex items-center space-x-3">
              <RadioGroupItem value="healthy" id="diag-healthy" />
              <Label htmlFor="diag-healthy">Visión normal</Label>
            </div>

            <div className="flex items-center space-x-3">
              <RadioGroupItem value="unknown" id="diag-unknown" />
              <Label htmlFor="diag-unknown">No tengo diagnóstico</Label>
            </div>
          </RadioGroup>
        </Card>

        {/* Action Buttons */}
        <div className="w-full flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
            
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-1" />
              Descargar PDF
            </Button>

            <Button
              onClick={handleTryAgain}
              variant="outline"
              className="w-full"
            >
              Repetir Prueba
            </Button>

            <Button
              disabled={!realDiagnosis}
              onClick={() => saveToSupabase()}
              className="w-full"
            >
              Finalizar
            </Button>

          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground max-w-2xl mx-auto">
          Descargo de responsabilidad: Esta herramienta está diseñada solo para fines educativos y de detección. 
          No reemplaza un examen profesional de la vista. Por favor, consulta a un optometrista certificado para 
          un diagnóstico preciso.
        </p>
      </div>
      
      {/* Feedback Modal */}
      <FeedbackModal
        open={showModal}
        onClose={() => setShowModal(false)}
        visionRecordId={visionRecordId}
        onFinish={handleFinish}
      />
    </div>
  );
};

export default HeuristicResults;