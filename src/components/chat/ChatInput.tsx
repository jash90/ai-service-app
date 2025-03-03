import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Send } from 'lucide-react-native';

interface ChatInputProps {
  textInput: string;
  setTextInput: (text: string) => void;
  handleSendText: () => void;
  isLoading: boolean;
  error: string | null;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  textInput,
  setTextInput,
  handleSendText,
  isLoading,
  error
}) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        value={textInput}
        onChangeText={setTextInput}
        placeholder="Type your question here..."
        placeholderTextColor="#999"
        onSubmitEditing={handleSendText}
        returnKeyType="send"
        editable={!isLoading && !error}
      />
      
      <TouchableOpacity
        style={styles.sendButton}
        onPress={handleSendText}
        disabled={isLoading || !!error || !textInput.trim()}
      >
        <Send size={24} color={textInput.trim() ? "#007AFF" : "#ccc"} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sendButton: {
    marginLeft: 10,
    padding: 8,
  },
}); 