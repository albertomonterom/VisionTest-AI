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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  visionRecordId: string | null;
  onFinish: () => void;
}

export const FeedbackModal = ({
  open,
  onClose,
  visionRecordId,
  onFinish,
}: FeedbackModalProps) => {
  const [usefulness, setUsefulness] = useState(4);
  const [easiness, setEasiness] = useState(4);
  const [recommend, setRecommend] = useState(true);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!visionRecordId) {
      toast.error("No se pudo asociar tu feedback al resultado guardado.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("user_feedback").insert({
      vision_record_id: visionRecordId,
      usefulness,
      easiness,
      recommend,
      feedback_text: feedbackText || null,
    });

    if (error) {
      console.error(error);
      toast.error("Error al enviar tu retroalimentación.");
    } else {
      toast.success("¡Gracias por tu retroalimentación!");
      onClose();
      onFinish();
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}} modal={true}>
      <DialogContent className="max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Ayúdanos a mejorar</DialogTitle>
          <DialogDescription>
            Tu opinión mejora la precisión de nuestro análisis. Solo toma 20 segundos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Pregunta 1 */}
          <div className="space-y-2">
            <Label>¿Qué tan útil fue esta prueba?</Label>
            <Slider
              max={5}
              min={1}
              step={1}
              value={[usefulness]}
              onValueChange={(v) => setUsefulness(v[0])}
            />
            <p className="text-xs text-muted-foreground">Valor: {usefulness} / 5</p>
          </div>

          {/* Pregunta 2 */}
          <div className="space-y-2">
            <Label>¿Qué tan fácil fue utilizarla?</Label>
            <Slider
              max={5}
              min={1}
              step={1}
              value={[easiness]}
              onValueChange={(v) => setEasiness(v[0])}
            />
            <p className="text-xs text-muted-foreground">Valor: {easiness} / 5</p>
          </div>

          {/* Pregunta 3 */}
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={recommend}
              onCheckedChange={(v: boolean) => setRecommend(v)}
            />
            <Label>Recomendaría esta herramienta</Label>
          </div>

          {/* Comentarios */}
          <div className="space-y-2">
            <Label>¿Algo que mejorar?</Label>
            <Textarea
              placeholder="Opcional"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar y Finalizar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
