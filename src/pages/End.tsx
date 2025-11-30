import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const End = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-medical-light/20 to-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8 animate-in fade-in duration-700">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-4">
            <Heart className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            ¡Gracias!
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Esperamos que esta evaluación de la vista haya sido útil. Recuerda agendar exámenes 
            completos de la vista regularmente con un profesional de la salud visual calificado.
          </p>
        </div>

        <div className="space-y-4 pt-8">
          <Button
            size="lg"
            onClick={() => navigate("/welcome")}
            className="w-full text-lg px-8 py-6 h-auto"
          >
            Realizar Otra Prueba
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.close()}
            className="w-full text-lg px-8 py-6 h-auto"
          >
            Cerrar Aplicación
          </Button>
        </div>

        <div className="pt-12 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">VisionTest AI</strong>
            <br />
            Una herramienta digital de evaluación de agudeza visual
          </p>
        </div>
      </div>
    </div>
  );
};

export default End;