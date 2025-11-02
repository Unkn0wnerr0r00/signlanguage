import React, { useState } from 'react';
import { CameraFeed } from './components/CameraFeed';
import { RecognizedWords } from './components/RecognizedWords';
import { TranslationDisplay } from './components/TranslationDisplay';
import { ControlPanel } from './components/ControlPanel';

export default function App() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [recognizedWords, setRecognizedWords] = useState<string[]>([]);
  const [translations, setTranslations] = useState<string[]>([]); // 빈 상태로 유지

  const handleCameraToggle = () => {
    setIsCameraActive((prev) => !prev);
    if (isCameraActive) setIsTranslating(false);
  };

  const handleTranslationToggle = () => {
    if (!isCameraActive) setIsCameraActive(true);
    setIsTranslating((prev) => !prev);
  };

  const handleClearHistory = () => {
    setRecognizedWords([]);
    setTranslations([]);
  };

  const handleFrame = (data: { detected_sign: string }) => {
    const word = data.detected_sign;
    if (!word) return;

    setRecognizedWords((prev) => {
      return [...prev, word].slice(-10); // 최근 10개만 유지
    });

    // 현재는 번역 기능 비활성화 상태
    // setTranslations(prev => [...prev, translatedWord].slice(-10));
  };

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

          <div className="mt-4 space-y-4">
            <RecognizedWords words={recognizedWords} isActive={isTranslating} />

            {/* TranslationDisplay는 현재 빈 상태로 추가 */}
            <TranslationDisplay
              translations={translations}
              currentTranslation=""
              isTranslating={false}
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
