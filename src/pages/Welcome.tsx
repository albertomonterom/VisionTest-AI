import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-medical-light/20 to-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in duration-700">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
            <Eye className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight">
            VisionTest AI
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Mide tu vista usando tu computadora y cámara
          </p>
        </div>

        <div className="space-y-4 pt-8">
          <Button
            size="lg"
            onClick={() => navigate("/calibration")}
            className="text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all"
          >
            Comenzar Prueba
          </Button>
          <p className="text-sm text-muted-foreground">
            Esta prueba toma aproximadamente 2-3 minutos
          </p>
        </div>

        <div className="pt-12 border-t border-border max-w-md mx-auto">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Importante:</strong> Esta es solo una herramienta de evaluación. 
            Siempre consulta a un profesional de la salud visual para un examen completo de la vista.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;