import { useCallback, useState } from 'react';
import * as Speech from 'expo-speech';

interface UseSpeechOptions {
  language?: string;
  rate?: number;
}

interface UseSpeechReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
}

export function useSpeech(options: UseSpeechOptions = {}): UseSpeechReturn {
  const { language = 'ja', rate = 0.9 } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(
    (text: string): void => {
      Speech.stop();
      setIsSpeaking(true);

      Speech.speak(text, {
        language,
        rate,
        pitch: 1.0,
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

  return { speak, stop, isSpeaking };
}
