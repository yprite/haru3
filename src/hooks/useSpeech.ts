import { useCallback, useState } from 'react';
import * as Speech from 'expo-speech';

interface UseSpeechOptions {
  language?: string;
  rate?: number;
}

interface UseSpeechReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
}

export function useSpeech(options: UseSpeechOptions = {}): UseSpeechReturn {
  const { language = 'ja-JP', rate = 0.9 } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(
    async (text: string): Promise<void> => {
      try {
        await Speech.stop();
        setIsSpeaking(true);
        await Speech.speak(text, {
          language,
          rate,
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
          onStopped: () => setIsSpeaking(false),
        });
      } catch {
        setIsSpeaking(false);
      }
    },
    [language, rate]
  );

  const stop = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking };
}
