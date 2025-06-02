import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Square } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VoiceRecorderProps {
  onTranscriptChange?: (transcript: string) => void;
  className?: string;
}

export function VoiceRecorder({ onTranscriptChange, className }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
  });

  const handleStartRecording = () => {
    if (!isSupported) return;
    
    resetTranscript();
    startListening();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    stopListening();
    setIsRecording(false);
    
    if (transcript) {
      onTranscriptChange?.(transcript);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  if (!isSupported) {
    return (
      <Alert className={className}>
        <AlertDescription>
          Voice recording is not supported in your browser. Please type your entry instead.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-center">
        <Button
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          className={cn(
            "w-16 h-16 rounded-full transition-all duration-300",
            isRecording && "recording-pulse"
          )}
          onClick={handleToggleRecording}
        >
          {isRecording ? (
            <Square className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </Button>
      </div>

      {isRecording && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            {isListening ? "Listening..." : "Click to start speaking"}
          </p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-100"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-200"></div>
          </div>
        </div>
      )}

      {(transcript || interimTranscript) && (
        <div className="bg-muted rounded-lg p-4">
          <h4 className="font-medium mb-2">Transcript:</h4>
          <p className="text-sm">
            {transcript}
            {interimTranscript && (
              <span className="text-muted-foreground italic">
                {interimTranscript}
              </span>
            )}
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Voice recognition error: {error}
          </AlertDescription>
        </Alert>
      )}

      {transcript && !isRecording && (
        <div className="flex justify-center space-x-2">
          <Button variant="outline" size="sm" onClick={resetTranscript}>
            Clear
          </Button>
          <Button 
            size="sm" 
            onClick={() => onTranscriptChange?.(transcript)}
          >
            Use Transcript
          </Button>
        </div>
      )}
    </div>
  );
}
