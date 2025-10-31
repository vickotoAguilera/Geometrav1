'use client';

import { useState, useEffect, useRef } from 'react';

interface UseSpeechRecognitionOptions {
  onTranscript?: (transcript: string) => void;
}

const getSpeechRecognition = () => {
  if (typeof window !== 'undefined') {
    return window.SpeechRecognition || window.webkitSpeechRecognition;
  }
  return null;
};

export const useSpeechRecognition = ({ onTranscript }: UseSpeechRecognitionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES'; // Set language to Spanish

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece;
        } else {
          interimTranscript += transcriptPiece;
        }
      }
      
      // Update final transcript
      if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
          if (onTranscript) {
            onTranscript(finalTranscript + ' '); // Add space for better sentence structure
          }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      // It can end unexpectedly, so only toggle state if it was meant to be stopped
      if (recognitionRef.current) {
        // if we are still supposed to be listening, restart it
      }
    };
    
    recognitionRef.current = recognition;

  }, [onTranscript]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript(''); // Clear previous transcript
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Could not start recognition", e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
       try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (e) {
        console.error("Could not stop recognition", e);
      }
    }
  };
  
  const isSupported = !!getSpeechRecognition();

  return { isListening, transcript, startListening, stopListening, isSupported };
};
