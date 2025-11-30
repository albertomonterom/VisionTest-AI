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
  const [distanceStatus, setDistanceStatus] = useState<"detecting" | "close" | "far" | "correct">("detecting");
  const faceDetectorRef = useRef<FaceDetector | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU"
          },
          runningMode: "VIDEO"
        });
        
        faceDetectorRef.current = detector;
      } catch (err) {
        console.error("MediaPipe initialization error:", err);
      }
    };

    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user", width: 640, height: 480 } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraReady(true);
          toast.success("Acceso a la cámara concedido");
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        setCameraError(true);
        toast.error("Acceso a la cámara denegado. Por favor, habilita los permisos de la cámara.");
      }
    };

    initMediaPipe();
    enableCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (faceDetectorRef.current) {
        faceDetectorRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!cameraReady || !faceDetectorRef.current || !videoRef.current) return;

    const detectDistance = () => {
      const video = videoRef.current;
      const detector = faceDetectorRef.current;
      
      if (!video || !detector || video.readyState !== 4) return;

      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        
        if (!ctx) return;
        
        ctx.drawImage(video, 0, 0);
        
        const detections = detector.detectForVideo(video, performance.now());
        
        if (detections.detections.length > 0) {
          const face = detections.detections[0];
          const boundingBox = face.boundingBox;
          const faceWidth = boundingBox?.width || 0;
          
          if (faceWidth > 380) {
            setDistanceStatus("close");
          } else if (faceWidth < 140) {
            setDistanceStatus("far");
          } else {
            setDistanceStatus("correct");
          }
        } else {
          setDistanceStatus("detecting");
        }
      } catch (err) {
        console.error("Face detection error:", err);
      }
    };

    detectionIntervalRef.current = window.setInterval(detectDistance, 1000);

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [cameraReady]);

  const handleVerifyDistance = () => {
    toast.success("¡Distancia verificada! Iniciando prueba...");
    setTimeout(() => navigate("/test"), 1000);
  };

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Camera className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl font-bold text-foreground">Calibración de Cámara</h2>
          <p className="text-lg text-muted-foreground">
            Por favor, posiciónate para la prueba
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border">
          <div className="aspect-video bg-muted relative">
            {cameraError ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
                  <p className="text-destructive font-medium">Acceso a la cámara denegado</p>
                  <p className="text-sm text-muted-foreground">Por favor, habilita los permisos de la cámara y actualiza</p>
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
            <div className="px-8 py-4 border-b border-border">
              <p className={`text-center font-medium transition-colors ${distanceMessage.color}`}>
                {distanceMessage.text}
              </p>
            </div>
          )}

          <div className="p-8 space-y-6">
            <div className="flex items-start gap-4 p-4 bg-medical-light/20 rounded-lg border border-medical-primary/20">
              <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Instrucciones</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                      1
                    </div>
                    <p>Colócate entre 40 y 80 cm de tu pantalla (aproximadamente distancia de lectura)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                      2
                    </div>
                    <p>Asegúrate de tener buena iluminación en tu rostro</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                      3
                    </div>
                    <p>Puedes quitarte los lentes si deseas hacer la prueba sin corrección</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                      4
                    </div>
                    <p>Cubre un ojo durante la prueba (alternando cada ojo)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                      5
                    </div>
                    <p>La aplicación ajustará automáticamente el tamaño de las letras según tu distancia</p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleVerifyDistance}
              disabled={!cameraReady || distanceStatus !== "correct"}
              className="w-full text-lg py-6 h-auto"
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