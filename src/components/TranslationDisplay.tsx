import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { motion, AnimatePresence } from 'motion/react';

interface TranslationEntry {
  id: string;
  timestamp: Date;
  detected: string;
  translation: string;
  confidence: number;
}

interface TranslationDisplayProps {
  translations: TranslationEntry[];
  currentTranslation: string;
  isTranslating: boolean;
}

export function TranslationDisplay({ 
  translations, 
  currentTranslation, 
  isTranslating 
}: TranslationDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Real-time Translation Output */}
      <Card
        className="shadow-lg"
        style={{ backgroundColor: '#9bbbd4'}}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-gray-900">번역</h3>
            {isTranslating && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Live
              </Badge>
            )}
          </div>

          <div
            className="min-h-[120px] flex items-center justify-center rounded-lg p-6 border"
            style={{ backgroundColor: '#fef01b'}}
          >
            <AnimatePresence mode="wait">
              {currentTranslation ? (
                <motion.p
                  key={currentTranslation}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-center text-2xl text-gray-900"
                >
                  {currentTranslation}
                </motion.p>
              ) : (
                <div className="text-center">
                  {isTranslating && (
                    <div className="flex items-center justify-center space-x-1 mb-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  )}
                  <p className="text-black-500">
                    {isTranslating
                      ? "수어 찾는 중..."
                      : "수어 번역을 기다리는 중..."}
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

      {/* Recent Translations */}
      {/* {translations.length > 0 && (
        <Card className="shadow-lg bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Translations</span>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                {translations.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                {translations.slice(0, 8).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-gray-900">{entry.translation}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {entry.detected} • {entry.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge 
                      variant={entry.confidence > 0.8 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {Math.round(entry.confidence * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )} }
    </div>
  );
      }*/}