import React, { useState, useEffect, useRef } from 'react';
import { CameraFeed } from './components/CameraFeed';
import { RecognizedWords } from './components/RecognizedWords';
import { TranslationDisplay } from './components/TranslationDisplay';
import { ControlPanel } from './components/ControlPanel';
import { motion, AnimatePresence } from 'framer-motion';

interface TranslationEntry {
  id: string;
  timestamp: Date;
  detected: string;
  translation: string;
  confidence: number;
}

export default function App() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [recognizedWords, setRecognizedWords] = useState<string[]>([]);
  const [translations, setTranslations] = useState<TranslationEntry[]>([]);
  const [currentTranslation, setCurrentTranslation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const lastUpdateTime = useRef<number>(Date.now());
  const timeoutRef = useRef<number | null>(null);

  // 카메라 토글
  const handleCameraToggle = () => {
    setIsCameraActive(prev => !prev);
    if (isCameraActive) setIsTranslating(false);
  };

  // 번역 토글
  const handleTranslationToggle = () => {
    if (!isCameraActive) setIsCameraActive(true);
    setIsTranslating(prev => !prev);
  };

  // 기록 초기화
  const handleClearHistory = () => {
    setRecognizedWords([]);
    setTranslations([]);
    setCurrentTranslation('');
  };

  // 프레임 수신 처리 (중복 단어 연속 필터)
  const handleFrame = (data: { detected_sign: string }) => {
    const word = data.detected_sign;
    if (!word) return;
    setRecognizedWords(prev => {
      if (prev[prev.length - 1] === word) return prev;
      return [...prev, word].slice(-10);
    });
    lastUpdateTime.current = Date.now();
  };

  // LLM 번역 요청
  const requestTranslation = async () => {
    if (recognizedWords.length === 0) return;
    setIsProcessing(true);
    try {
      const res = await fetch('http://localhost:8000/generate_translation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recognized_words: recognizedWords })
      });
      const data = await res.json();
      const sentence = data.translated_sentence || '번역 실패';
      setCurrentTranslation(sentence);
      setTranslations(prev => [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          timestamp: new Date(),
          detected: recognizedWords.join(' '),
          translation: sentence,
          confidence: 1.0
        },
        ...prev
      ].slice(0, 20));
    } catch (e) {
      console.error('번역 요청 실패:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // 자동 3초 번역 트리거
  useEffect(() => {
    if (!isTranslating || recognizedWords.length === 0) return;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      const elapsed = Date.now() - lastUpdateTime.current;
      if (elapsed >= 3000) requestTranslation();
    }, 3000);
    return () => { if (timeoutRef.current) window.clearTimeout(timeoutRef.current); };
  }, [recognizedWords, isTranslating]);

  return (
    <div className="min-h-screen bg-gray-200 p-6 font-sans">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold">손TALK💬</h1>
        <p className="text-lg">실시간 수어 인식</p>
      </header>
      <div className="flex gap-6">
        <div className="flex-1">
          <CameraFeed
            isActive={isCameraActive}
            isTranslating={isTranslating}
            onToggle={handleCameraToggle}
            onFrame={handleFrame}
          />
          <div className="mt-4 space-y-4 relative">
            <RecognizedWords
              words={recognizedWords}
              isActive={isTranslating}
              onForceTranslate={requestTranslation}
            />
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-center text-blue-600 font-semibold"
                >
                  🧠 번역 중...
                </motion.div>
              )}
            </AnimatePresence>
            <TranslationDisplay
              translations={translations}
              currentTranslation={currentTranslation}
              isTranslating={isTranslating}
            />
          </div>
        </div>
        <div className="w-80">
          <ControlPanel
            isTranslating={isTranslating}
            onToggleTranslation={handleTranslationToggle}
            onClearHistory={handleClearHistory}
            tone="formal"
            onToneChange={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
