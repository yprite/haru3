import { useCallback, useState, useEffect } from 'react';
import * as Speech from 'expo-speech';

interface UseSpeechOptions {
  language?: string;
  rate?: number;
}

interface UseSpeechReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isAvailable: boolean;
}

export function useSpeech(options: UseSpeechOptions = {}): UseSpeechReturn {
  const { language = 'ja-JP', rate = 0.9 } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    Speech.getAvailableVoicesAsync().then((voices) => {
      setIsAvailable(voices.length > 0);
    });
  }, []);

  const speak = useCallback(
    (text: string): void => {
      Speech.stop();
      setIsSpeaking(true);
      Speech.speak(text, {
        language,
        rate,
        onStart: () => setIsSpeaking(true),
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
      });
    },
    [language, rate]
  );

  const stop = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking, isAvailable };
}
