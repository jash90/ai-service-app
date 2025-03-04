import { useState, useCallback } from 'react';
import { isRecognitionAvailable, ExpoWebSpeechRecognition } from 'expo-speech-recognition';
import { DEFAULT_LANGUAGE } from '../services/storage';

export const useVoice = (
    handleFinalTranscript: (transcript: string) => void,
    addMessage: (text: string, isUser: boolean) => void
) => {
    const [isRecording, setIsRecording] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [recognition, setRecognition] = useState<ExpoWebSpeechRecognition | null>(null);

    const startRecording = useCallback(async () => {
        if (!isRecognitionAvailable()) {
            addMessage('Speech recognition is not available on this device', false);
            return;
        }

        const recognitionInstance = new ExpoWebSpeechRecognition();
        recognitionInstance.interimResults = true;
        recognitionInstance.continuous = false;
        recognitionInstance.lang = DEFAULT_LANGUAGE;

        setRecognition(recognitionInstance);
        recognitionInstance.start();
    }, [addMessage]);

    const stopRecording = useCallback(async () => {
        if (!isRecording || !recognition) return;

        recognition.stop();
        setRecognition(null);
        setIsRecording(false);

        if (currentTranscript) {
            handleFinalTranscript(currentTranscript);
        }
    }, [isRecording, currentTranscript, handleFinalTranscript, recognition]);

    return {
        isRecording,
        setIsRecording,
        currentTranscript,
        setCurrentTranscript,
        recognition,
        startRecording,
        stopRecording,
    };
}; 