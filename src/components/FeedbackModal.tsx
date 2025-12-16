import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onFinish: (feedback: {
    planDoctor: "si" | "no" | "no_se";
    timeframe: string;
    priority: number;
    studyInterest: "si" | "no" | "depende";
    multiVisitWillingness: number;
    mainFactor: string;
  }) => void;
}

export const FeedbackModal = ({
  open,
  onFinish,
}: FeedbackModalProps) => {
  const [planDoctor, setPlanDoctor] =
    useState<"si" | "no" | "no_se">("no_se");
  const [timeframe, setTimeframe] = useState<string | null>(null);
  const [priority, setPriority] = useState(3);
  const [studyInterest, setStudyInterest] =
    useState<"si" | "no" | "depende">("depende");
  const [multiVisitWillingness, setMultiVisitWillingness] = useState(3);
  const [mainFactor, setMainFactor] = useState<string | null>(null);

  const isFormComplete =
    timeframe !== null &&
    mainFactor !== null;

  const handleSubmit = () => {
    if (!isFormComplete) return;

    onFinish({
      planDoctor,
      timeframe,
      priority,
      studyInterest,
      multiVisitWillingness,
      mainFactor,
    });
  };

  return (
    <Dialog open={open} onOpenChange={() => {}} modal>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Cuestionario breve</DialogTitle>
          <DialogDescription>
            Sus respuestas nos ayudan a comprender el seguimiento clínico de la
            miopía. Solo toma unos segundos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-2">

          {/* Pregunta 1 */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              ¿Planea acudir a un médico para revisar su vista por posibles
              problemas de miopía?
            </Label>
            {[
              { label: "Sí", value: "si" },
              { label: "No", value: "no" },
              { label: "Aún no lo sé", value: "no_se" },
            ].map((o) => (
              <div key={o.value} className="flex items-center space-x-3">
                <Checkbox
                  checked={planDoctor === o.value}
                  onCheckedChange={() => setPlanDoctor(o.value as any)}
                />
                <span className="text-sm text-muted-foreground">{o.label}</span>
              </div>
            ))}
          </div>

          {/* Pregunta 2 */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Si planea acudir, ¿en qué plazo lo haría?
            </Label>
            {[
              "En las próximas 2 semanas",
              "En 1–2 meses",
              "En 3–6 meses",
              "En más de 6 meses",
              "No tengo un plazo definido",
            ].map((o) => (
              <div key={o} className="flex items-center space-x-3">
                <Checkbox
                  checked={timeframe === o}
                  onCheckedChange={() => setTimeframe(o)}
                />
                <span className="text-sm text-muted-foreground">{o}</span>
              </div>
            ))}
          </div>

          {/* Pregunta 3 */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              ¿Qué prioridad tiene para usted revisar su salud visual en este
              momento?
            </Label>
            <Slider
              min={1}
              max={5}
              step={1}
              value={[priority]}
              onValueChange={(v) => setPriority(v[0])}
            />
            <p className="text-xs text-muted-foreground">
              {["Ninguna", "Baja", "Media", "Alta", "Muy alta"][priority - 1]}
            </p>
          </div>

          {/* Pregunta 4 */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Si un especialista le invitara a participar en un estudio
              profesional sobre miopía, ¿asistiría a las evaluaciones requeridas?
            </Label>
            {[
              { label: "Sí", value: "si" },
              { label: "No", value: "no" },
              { label: "Dependería de las condiciones", value: "depende" },
            ].map((o) => (
              <div key={o.value} className="flex items-center space-x-3">
                <Checkbox
                  checked={studyInterest === o.value}
                  onCheckedChange={() => setStudyInterest(o.value as any)}
                />
                <span className="text-sm text-muted-foreground">{o.label}</span>
              </div>
            ))}
          </div>

          {/* Pregunta 5 */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              ¿Qué tan dispuesto(a) estaría a asistir a más de una cita médica si
              el estudio lo requiere?
            </Label>
            <Slider
              min={1}
              max={5}
              step={1}
              value={[multiVisitWillingness]}
              onValueChange={(v) => setMultiVisitWillingness(v[0])}
            />
            <p className="text-xs text-muted-foreground">
              {["Nada", "Poco", "Moderado", "Bastante", "Totalmente"][multiVisitWillingness - 1]}
            </p>
          </div>

          {/* Pregunta 6 */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              ¿Qué factor influye más en su decisión de acudir o no a una
              evaluación por miopía?
            </Label>
            {[
              "Tiempo",
              "Costo",
              "Ubicación",
              "Recomendación médica",
              "No lo considero necesario",
              "Otro",
            ].map((o) => (
              <div key={o} className="flex items-center space-x-3">
                <Checkbox
                  checked={mainFactor === o}
                  onCheckedChange={() => setMainFactor(o)}
                />
                <span className="text-sm text-muted-foreground">{o}</span>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!isFormComplete}
            >
              Enviar y finalizar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};