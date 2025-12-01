import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

const Calibration = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [distanceStatus, setDistanceStatus] = useState<
    "detecting" | "close" | "far" | "correct"
  >("detecting");

  const faceDetectorRef = useRef<FaceDetector | null>(null);
  const intervalRef = useRef<number | null>(null);

  // ---------------------------
  // INIT CAMERA + MEDIAPIPE
  // ---------------------------
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
        });

        faceDetectorRef.current = detector;
      } catch (err) {
        console.error("MediaPipe initialization error:", err);
        toast.error("Error cargando detector facial");
      }
    };

    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });

        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            setCameraReady(true);
            toast.success("Cámara lista");
          };

          videoRef.current.srcObject = stream;
        }

      } catch (err) {
        setCameraError(true);
        toast.error("No se pudo acceder a la cámara");
      }
    };

    initMediaPipe();
    enableCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }

      if (intervalRef.current) clearInterval(intervalRef.current);

      if (faceDetectorRef.current) {
        faceDetectorRef.current.close();
      }
    };
  }, []);

  // ---------------------------
  // DISTANCE DETECTION LOOP
  // ---------------------------
  useEffect(() => {
    if (!cameraReady || !videoRef.current || !faceDetectorRef.current) return;

    const detect = () => {
      const video = videoRef.current!;
      const detector = faceDetectorRef.current!;

      if (video.readyState !== 4) return;

      try {
        const detections = detector.detectForVideo(video, performance.now());

        // If no detections -> scanning mode
        if (!detections || !detections.detections || detections.detections.length === 0) {
          setDistanceStatus("detecting");
          return;
        }

        const face = detections.detections[0];
        const box = face.boundingBox;
        const faceWidth = box?.width || 0;
        const frameWidth = video.videoWidth;

        const ratio = faceWidth / frameWidth;

        if (ratio > 0.30) setDistanceStatus("close");
        else if (ratio < 0.22) setDistanceStatus("far");
        else setDistanceStatus("correct");
      } catch (err) {
        console.error("Error en detección:", err);
      }
    };

    // detect every ~350ms (good balance)
    intervalRef.current = window.setInterval(detect, 350);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cameraReady]);

  // ---------------------------
  // HANDLE CONTINUE
  // ---------------------------
  const handleVerifyDistance = () => {
    // Remove any existing toast notifications
    toast.dismiss();

    if (distanceStatus !== "correct") {
      toast.error("Ajusta tu distancia antes de continuar");
      return;
    }

    toast.success("Distancia correcta, iniciando prueba...");
    setTimeout(() => navigate("/test"), 800);
  };

  // ---------------------------
  // DISTANCE STATUS MESSAGING
  // ---------------------------
  const getDistanceMessage = () => {
    switch (distanceStatus) {
      case "detecting":
        return { text: "Detectando distancia…", color: "text-muted-foreground" };
      case "close":
        return { text: "Estás demasiado cerca, aléjate un poco", color: "text-destructive" };
      case "far":
        return { text: "Estás demasiado lejos, acércate un poco", color: "text-yellow-600" };
      case "correct":
        return { text: "✓ Distancia correcta", color: "text-green-600" };
    }
  };

  const distanceMessage = getDistanceMessage();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 py-4">
      <div className="max-w-4xl w-full space-y-3">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <Camera className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Calibración de Cámara</h2>
          <p className="text-sm text-muted-foreground">
            Posiciónate para la prueba
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border">
          <div className="bg-muted relative h-64 md:h-80">
            {cameraError ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                  <p className="text-destructive font-medium text-sm">Acceso a la cámara denegado</p>
                  <p className="text-xs text-muted-foreground">Por favor, habilita los permisos de la cámara y actualiza</p>
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {cameraReady && !cameraError && (
            <div className="px-4 py-2 border-b border-border">
              <p className={`text-center text-sm font-medium transition-colors ${distanceMessage.color}`}>
                {distanceMessage.text}
              </p>
            </div>
          )}

          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3 p-3 bg-medical-light/20 rounded-lg border border-medical-primary/20">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm mb-1.5">Instrucciones</h3>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-[10px]">
                      1
                    </div>
                    <p className="leading-relaxed">Colócate entre 60 y 80 cm de tu pantalla</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-[10px]">
                      2
                    </div>
                    <p className="leading-relaxed">Asegúrate de tener buena iluminación</p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              size="default"
              onClick={handleVerifyDistance}
              disabled={!cameraReady || distanceStatus !== "correct"}
              className="w-full"
            >
              Verificar Distancia y Continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calibration;