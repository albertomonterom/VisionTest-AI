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
          videoRef.current.srcObject = stream;
          setCameraReady(true);
          toast.success("Cámara lista");
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

        if (ratio > 0.55) setDistanceStatus("close");
        else if (ratio < 0.18) setDistanceStatus("far");
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
  const distanceMessageMap = {
    detecting: { text: "Detectando distancia…", color: "text-muted-foreground" },
    close: { text: "Estás demasiado cerca, aléjate un poco", color: "text-destructive font-semibold" },
    far: { text: "Estás demasiado lejos, acércate un poco", color: "text-yellow-600 font-semibold" },
    correct: { text: "✓ Distancia correcta", color: "text-green-600 font-semibold" },
  };

  const msg = distanceMessageMap[distanceStatus];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* HEADER */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Camera className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl font-bold text-foreground">Calibración de Cámara</h2>
          <p className="text-lg text-muted-foreground">Ajusta tu distancia para comenzar</p>
        </div>

        {/* VIDEO FEED */}
        <div className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border">
          <div className="aspect-video relative bg-muted">
            {cameraError ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
                  <p className="text-destructive font-medium">Acceso a la cámara denegado</p>
                  <p className="text-sm text-muted-foreground">
                    Habilita permisos y actualiza
                  </p>
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

          {/* DISTANCE MESSAGE */}
          {cameraReady && !cameraError && (
            <div className="px-8 py-4 border-b border-border">
              <p className={`text-center transition-colors ${msg.color}`}>{msg.text}</p>
            </div>
          )}

          {/* INSTRUCTIONS + BUTTON */}
          <div className="p-8 space-y-6">
            <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Instrucciones</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>1. Colócate entre 40 y 80 cm de la pantalla.</li>
                  <li>2. Asegura buena iluminación en tu rostro.</li>
                  <li>3. Si deseas, quítate los lentes para medir tu visión sin corrección.</li>
                  <li>4. Cubre un ojo durante la prueba (alternarás más adelante).</li>
                  <li>5. El tamaño de las letras se ajustará automáticamente.</li>
                </ul>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleVerifyDistance}
              disabled={!cameraReady || distanceStatus !== "correct"}
              className="w-full text-lg py-6 h-auto"
            >
              Verificar distancia y continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calibration;