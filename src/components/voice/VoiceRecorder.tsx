import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Mic, CircleStop as StopCircle } from 'lucide-react-native';

interface VoiceRecorderProps {
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  isLoading: boolean;
  error: string | null;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  isRecording,
  startRecording,
  stopRecording,
  isLoading,
  error
}) => {
  return (
    <TouchableOpacity
      style={[styles.recordButton, isRecording && styles.recordingButton]}
      onPress={isRecording ? stopRecording : startRecording}
      disabled={isLoading || !!error}
    >
      {isRecording ? (
        <StopCircle size={32} color="#fff" />
      ) : (
        <Mic size={32} color="#fff" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
  },
}); 