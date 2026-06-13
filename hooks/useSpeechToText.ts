'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechToText(language: string = 'en-US') {
  const [isListening, setIsListening] = useState(false);
  const [liveStreamText, setLiveStreamText] = useState('');
  const [accumulatedTranscript, setAccumulatedTranscript] = useState('');
  const recognitionInstance = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Speech recognition is not natively supported by this browser.");
      return;
    }

    const recognizer = new SpeechRecognition();
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.lang = language;

    recognizer.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transValue = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transValue;
        } else {
          interim += transValue;
        }
      }
      if (final) {
        setAccumulatedTranscript(prev => prev + ' ' + final.trim());
      }
      setLiveStreamText(interim);
    };

    recognizer.onerror = (e: any) => {
      console.error("Speech recognition error hook: ", e);
      setIsListening(false);
    };

    recognizer.onend = () => {
      setIsListening(false);
    };

    recognitionInstance.current = recognizer;
    
    return () => {
      if (recognitionInstance.current) {
        recognitionInstance.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionInstance.current) return;
    setAccumulatedTranscript('');
    setLiveStreamText('');
    recognitionInstance.current.start();
    setIsListening(true);
  }, []);

  const stopAndSubmit = useCallback(() => {
    if (!recognitionInstance.current) return '';
    recognitionInstance.current.stop();
    setIsListening(false);
    
    // Combine what we finished and what might still be in interim
    const result = (accumulatedTranscript + ' ' + liveStreamText).trim();
    setAccumulatedTranscript('');
    setLiveStreamText('');
    return result;
  }, [accumulatedTranscript, liveStreamText]);

  return { isListening, liveStreamText, startListening, stopAndSubmit };
}
