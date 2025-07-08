"use client";

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Mic, MicOff, Bot, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTextToSpeechAction } from "@/app/actions";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type VoiceAssistantProps = {
  onCommand: (command: string) => void;
};

export type VoiceAssistantHandle = {
  speak: (text: string) => void;
};

const VoiceAssistant = forwardRef<VoiceAssistantHandle, VoiceAssistantProps>(
  ({ onCommand }, ref) => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    
    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useImperativeHandle(ref, () => ({
      speak(text: string) {
        if (isSpeaking || !text) return;
        
        setIsSpeaking(true);
        if (isListening) {
          recognitionRef.current?.stop();
        }

        getTextToSpeechAction(text)
          .then(result => {
            if (result.success && result.data) {
              if (audioRef.current) {
                audioRef.current.pause();
              }
              const audio = new Audio(result.data.media);
              audioRef.current = audio;
              audio.play();
              audio.onended = () => {
                setIsSpeaking(false);
                audioRef.current = null;
              };
               audio.onerror = () => {
                console.error("Audio playback error.");
                setIsSpeaking(false);
              }
            } else {
              console.error("TTS Error:", result.error);
              setIsSpeaking(false);
            }
          })
          .catch(error => {
            console.error("TTS Exception:", error);
            setIsSpeaking(false);
          });
      }
    }));

    useEffect(() => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const command = event.results[event.results.length - 1][0].transcript;
          onCommand(command);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
        };
        
        recognition.onend = () => {
            setIsListening(false);
        }

        recognitionRef.current = recognition;
      } else {
        setIsSupported(false);
      }
    }, [onCommand]);

    const handleToggleListen = () => {
      if (!isSupported || isSpeaking) return;

      if (isListening) {
        recognitionRef.current?.stop();
      } else {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsSpeaking(false);
        }
        recognitionRef.current?.start();
        setIsListening(true);
      }
    };

    const getButtonIcon = () => {
        if (isSpeaking) return <Volume2 className="animate-pulse" />;
        if (isListening) return <MicOff />;
        return <Mic />;
    }

    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className={cn(
            "rounded-full w-16 h-16 shadow-lg transition-all duration-300 transform hover:scale-110",
            isListening && "bg-red-500 hover:bg-red-600",
            isSpeaking && "bg-blue-500 hover:bg-blue-600",
          )}
          onClick={handleToggleListen}
          disabled={!isSupported || isSpeaking}
          title={isSupported ? "Voice Assistant" : "Voice recognition not supported"}
        >
          {getButtonIcon()}
        </Button>
      </div>
    );
  }
);
VoiceAssistant.displayName = "VoiceAssistant";
export default VoiceAssistant;
