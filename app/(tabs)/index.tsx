import React from 'react';
import { Platform, StyleSheet, KeyboardAvoidingView, Alert } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useRouter, useFocusEffect } from 'expo-router';
import { getAIModel } from '../../services/storage';

import { ChatInput } from '../../components/chat/ChatInput';
import { VoiceRecorder } from '../../components/voice/VoiceRecorder';
import { ModelInfo } from '../../components/model/ModelInfo';
import { ThreadInfo } from '../../components/thread/ThreadInfo';
import { ErrorBanner } from '../../components/common/ErrorBanner';

import { useChat } from '../../hooks/useChat';
import { useVoice } from '../../hooks/useVoice';

export default function ChatScreen() {
  const [textInput, setTextInput] = React.useState('');
  const router = useRouter();

  const {
    messages,
    currentThread,
    isLoading,
    error,
    currentModel,
    createNewThread,
    addMessage,
    handleFinalTranscript,
  } = useChat();

  const {
    isRecording,
    setIsRecording,
    startRecording,
    stopRecording,
  } = useVoice(handleFinalTranscript, addMessage);

  useSpeechRecognitionEvent('result', (event) => {
    if (event.results.length > 0 && event.isFinal && isRecording) {
      handleFinalTranscript(event.results[0].transcript);
      setIsRecording(false);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    addMessage(`Failed to recognize speech: ${event.message}`, false);
    setIsRecording(false);
  });

  useSpeechRecognitionEvent('start', () => setIsRecording(true));

  const handleSendText = () => {
    const trimmedText = textInput.trim();
    if (!trimmedText) return;
    setTextInput('');
    handleFinalTranscript(trimmedText);
  };

  useFocusEffect(
    React.useCallback(() => {
      const reloadSettings = async () => {
        const storedModel = await getAIModel();
        if (storedModel !== currentModel) {
          router.replace('/');
        }
      };
      reloadSettings();
    }, [currentModel, router])
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ModelInfo
        currentModel={currentModel}
        onNewChat={async () => {
          try {
            await createNewThread();
          } catch {
            Alert.alert('Error', 'Failed to create new thread');
          }
        }}
      />

      <ThreadInfo title={currentThread?.title || ''} />

      <GiftedChat
        messages={messages}
        user={{ _id: 1 }}
        renderInputToolbar={() => null}
        inverted={true}
        renderAvatar={null}
      />

      <ChatInput
        textInput={textInput}
        setTextInput={setTextInput}
        handleSendText={handleSendText}
        isLoading={isLoading}
        error={error}
      />

      {error ? (
        <ErrorBanner />
      ) : (
        <VoiceRecorder
          isRecording={isRecording}
          startRecording={startRecording}
          stopRecording={stopRecording}
          isLoading={isLoading}
          error={error}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});