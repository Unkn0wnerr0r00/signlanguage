// src/components/CameraFeed.tsx
import React, { useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Camera, CameraOff } from 'lucide-react';

interface ServerResponse {
  translation: string;
  detected_sign: string;
  confidence: number;
  processed_frame: string;
}

interface CameraFeedProps {
  isActive: boolean;
  isTranslating: boolean;
  onToggle: () => void;
  onFrame?: (processedData: Omit<ServerResponse, 'processed_frame'>) => void;
}

export function CameraFeed({ isActive, isTranslating, onToggle, onFrame }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastRecognition = useRef<number>(0);

  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 200ms마다 서버 전송
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    tempCanvas.getContext('2d')?.drawImage(video, 0, 0);
    const imageData = tempCanvas.toDataURL('image/jpeg', 0.8);

    fetch('http://localhost:8000/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frame_data: imageData }),
    })
      .then(res => res.json())
      .then((data: ServerResponse) => {
        // 화면에 Mediapipe 처리 영상 표시 (항상 200ms마다)
        const img = new Image();
        img.src = data.processed_frame;
        img.onload = () => {
          if (canvas.width !== img.width) canvas.width = img.width;
          if (canvas.height !== img.height) canvas.height = img.height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };

        // recognizedWords 갱신은 2000ms마다
        const now = Date.now();
        if (isTranslating && onFrame && now - lastRecognition.current >= 2000) {
          lastRecognition.current = now;
          onFrame({ translation: data.translation, detected_sign: data.detected_sign, confidence: data.confidence });
        }
      })
      .catch(err => console.error("Fetch error:", err));

    animationFrameId.current = requestAnimationFrame(processFrame);
  }, [isActive, isTranslating, onFrame]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          animationFrameId.current = requestAnimationFrame(processFrame);
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    const stopCamera = () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    if (isActive) startCamera();
    else stopCamera();

    return () => stopCamera();
  }, [isActive, processFrame]);

  return (
    <Card className="relative overflow-hidden shadow-lg bg-white border border-gray-200">
      <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
        <video ref={videoRef} autoPlay muted playsInline className="hidden" />
        <canvas ref={canvasRef} className="w-full h-full object-contain" />

        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black bg-opacity-50">
            <Camera size={48} className="mb-4" />
            <p>카메라가 꺼져 있습니다.</p>
          </div>
        )}

        <div className="absolute top-4 left-4">
          <Button onClick={onToggle} variant="secondary">
            {isActive ? <CameraOff className="w-4 h-4 mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
            {isActive ? '카메라 중지' : '카메라 시작'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
