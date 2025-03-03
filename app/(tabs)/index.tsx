import { useCallback, useState, useEffect, useRef } from 'react';
import { View, Platform, StyleSheet, TouchableOpacity, Text, TextInput, KeyboardAvoidingView, Alert } from 'react-native';
import { Mic, CircleStop as StopCircle, Send, MessageSquare, Plus } from 'lucide-react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { useAI } from '../../src/services/ai';
import { 
  isRecognitionAvailable,
  useSpeechRecognitionEvent, 
  ExpoSpeechRecognitionResultEvent,
  ExpoSpeechRecognitionErrorEvent,
  ExpoWebSpeechRecognition
} from 'expo-speech-recognition';
import { speak } from 'expo-speech';
import { useRouter, useFocusEffect } from 'expo-router';
import { 
  getLanguage, 
  DEFAULT_LANGUAGE, 
  MODEL_TO_PROVIDER, 
  MODEL_PROVIDERS,
  saveChatThread,
  getChatThreadById,
  getCurrentThreadId,
  saveCurrentThreadId,
  ChatThread,
  getAIModel
} from '../../src/services/storage';

export default function SpeechToTextScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { generateResponse, isLoading, error, isInitialized, currentModel, setCurrentModel } = useAI();
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [recognition, setRecognition] = useState<ExpoWebSpeechRecognition | null>(null);
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [currentThread, setCurrentThread] = useState<ChatThread | null>(null);
  const router = useRouter();
  const aiServiceInitialized = useRef(false);

  // Get the provider for the current model
  const currentModelProvider = MODEL_TO_PROVIDER[currentModel] || MODEL_PROVIDERS.OPENAI;

  // Load language setting and current thread
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedLanguage = await getLanguage();
        setLanguage(storedLanguage);
        
        // Load current thread ID
        const threadId = await getCurrentThreadId();
        console.log('Current thread ID loaded:', threadId);
        
        if (threadId) {
          // Load thread data
          const thread = await getChatThreadById(threadId);
          console.log('Thread loaded:', thread?.id, 'with', thread?.messages?.length, 'messages');
          
          if (thread) {
            setCurrentThreadId(threadId);
            setCurrentThread(thread);
            
            if (thread.messages && thread.messages.length > 0) {
              // Convert thread messages to GiftedChat format
              const giftedMessages = thread.messages.map((msg): IMessage => ({
                _id: msg.id,
                text: msg.content,
                createdAt: new Date(msg.timestamp),
                user: {
                  _id: msg.isUser ? 1 : 2,
                  name: msg.isUser ? 'You' : 'AI Assistant',
                  avatar: msg.isUser ? undefined : 'https://images.unsplash.com/photo-1531379410502-63bfe8cdaf6f?w=64&h=64&fit=crop&crop=faces',
                },
              }));
              setMessages(giftedMessages);
              console.log('Loaded', giftedMessages.length, 'messages from thread');
            } else {
              // Create a welcome message for new threads
              const welcomeMessage: IMessage = {
                _id: 'welcome',
                text: `Welcome to a new conversation! You can ask me anything.`,
                createdAt: new Date(),
                user: {
                  _id: 2,
                  name: 'AI Assistant',
                  avatar: 'https://images.unsplash.com/photo-1531379410502-63bfe8cdaf6f?w=64&h=64&fit=crop&crop=faces',
                },
              };
              setMessages([welcomeMessage]);
              console.log('Created welcome message for empty thread');
            }
          } else {
            console.log('Thread not found, creating new thread');
            const newThread = await createNewThread();
            setCurrentThreadId(newThread.id);
            setCurrentThread(newThread);
          }
        } else {
          // Create a new thread if none exists
          console.log('No current thread ID, creating new thread');
          const newThread = await createNewThread();
          setCurrentThreadId(newThread.id);
          setCurrentThread(newThread);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        // Create a new thread as fallback
        try {
          console.log('Creating fallback thread due to error');
          const newThread = await createNewThread();
          setCurrentThreadId(newThread.id);
          setCurrentThread(newThread);
        } catch (fallbackError) {
          console.error('Failed to create fallback thread:', fallbackError);
        }
      }
    };

    loadSettings();
  }, []);

  // Create a new thread
  const createNewThread = useCallback(async () => {
    try {
      const newThreadId = Date.now().toString();
      console.log('Creating new thread with ID:', newThreadId);
      
      const newThread: ChatThread = {
        id: newThreadId,
        title: 'New Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: []
      };
      
      // First save the thread to storage
      await saveChatThread(newThread);
      console.log('New thread saved to storage');
      
      // Then set it as current thread
      await saveCurrentThreadId(newThreadId);
      console.log('Current thread ID set to:', newThreadId);
      
      // Update state synchronously to ensure consistency
      setCurrentThreadId(newThreadId);
      setCurrentThread(newThread);
      
      // Add welcome message to the thread
      const welcomeMessage: IMessage = {
        _id: 'welcome',
        text: `Welcome to a new conversation! You can ask me anything.`,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'AI Assistant',
          avatar: 'https://images.unsplash.com/photo-1531379410502-63bfe8cdaf6f?w=64&h=64&fit=crop&crop=faces',
        },
      };
      
      // Update messages in UI
      setMessages([welcomeMessage]);
      
      // Save welcome message to thread
      const updatedThread = { ...newThread };
      updatedThread.messages = [{
        id: welcomeMessage._id.toString(),
        content: welcomeMessage.text,
        timestamp: welcomeMessage.createdAt instanceof Date ? welcomeMessage.createdAt.getTime() : welcomeMessage.createdAt,
        isUser: false
      }];
      
      // Save updated thread with welcome message
      await saveChatThread(updatedThread);
      setCurrentThread(updatedThread);
      
      console.log('Thread created and initialized with welcome message');
      return updatedThread;
    } catch (error) {
      console.error('Error creating new thread:', error);
      throw error;
    }
  }, []);

  // Save message to current thread
  const saveMessageToThread = useCallback(async (message: IMessage, isUser: boolean) => {
    try {
      // Always try to get the most recent thread ID first
      const mostRecentThreadId = await getCurrentThreadId();
      let threadToUse = null;
      
      if (mostRecentThreadId) {
        // Try to load the most recent thread
        threadToUse = await getChatThreadById(mostRecentThreadId);
        console.log('Attempting to use most recent thread:', mostRecentThreadId);
      }
      
      // If no valid thread exists, create a new one
      if (!threadToUse) {
        console.log('No valid recent thread found, creating new one');
        threadToUse = await createNewThread();
        console.log('Created new thread:', threadToUse.id);
      }
      
      // Ensure we're using the correct thread in state
      if (threadToUse.id !== currentThreadId) {
        console.log('Updating current thread from', currentThreadId, 'to', threadToUse.id);
        setCurrentThreadId(threadToUse.id);
        setCurrentThread(threadToUse);
      }
      
      // Create a deep copy of the thread to avoid reference issues
      const updatedThread = JSON.parse(JSON.stringify(threadToUse));
      
      // Ensure messages array exists
      if (!updatedThread.messages) {
        updatedThread.messages = [];
      }
      
      // Update thread title with first user message if it's still the default
      if (isUser && updatedThread.title === 'New Conversation' && message.text.length > 0) {
        updatedThread.title = message.text.substring(0, 30) + (message.text.length > 30 ? '...' : '');
        console.log('Updated thread title to:', updatedThread.title);
      }
      
      // Create message object
      const threadMessage = {
        id: message._id.toString(),
        content: message.text,
        timestamp: message.createdAt instanceof Date ? message.createdAt.getTime() : message.createdAt,
        isUser
      };
      
      // Add message to thread
      updatedThread.messages.push(threadMessage);
      updatedThread.updatedAt = Date.now();
      
      // Save updated thread
      await saveChatThread(updatedThread);
      
      // Update local state
      setCurrentThread(updatedThread);
      console.log('Message saved successfully to thread:', updatedThread.id);
    } catch (error) {
      console.error('Error in saveMessageToThread:', error);
      // Attempt to recover by creating a new thread
      try {
        const newThread = await createNewThread();
        console.log('Created recovery thread:', newThread.id);
        // Add the message to the new thread
        await saveMessageToThread(message, isUser);
      } catch (recoveryError) {
        console.error('Failed to recover from saveMessageToThread error:', recoveryError);
      }
    }
  }, [currentThreadId, createNewThread]);

  const addMessage = useCallback((text: string, isUser: boolean = true) => {
    const message: IMessage = {
      _id: Date.now().toString() + text,
      text,
      createdAt: new Date(),
      user: {
        _id: isUser ? 1 : 2,
        name: isUser ? 'You' : 'AI Assistant',
        avatar: isUser ? undefined : 'https://images.unsplash.com/photo-1531379410502-63bfe8cdaf6f?w=64&h=64&fit=crop&crop=faces',
      },
    };
    
    // Add message to UI
    setMessages(previousMessages => GiftedChat.append(previousMessages, [message]));
    
    // Save message to thread
    saveMessageToThread(message, isUser);
  }, [saveMessageToThread]);

  // Handle speech recognition results
  useSpeechRecognitionEvent('result', (event: ExpoSpeechRecognitionResultEvent) => {
    if (event.results.length > 0) {
      const transcript = event.results[0].transcript;
      setCurrentTranscript(transcript);
      
      // If this is the final result, process it
      if (event.isFinal && isRecording) {
        handleFinalTranscript(transcript);
        setIsRecording(false);
      }
    }
  });

  // Handle speech recognition errors
  useSpeechRecognitionEvent('error', (event: ExpoSpeechRecognitionErrorEvent) => {
    console.error('Speech recognition error:', event.error, event.message);
    addMessage(`Failed to recognize speech: ${event.message}`, false);
    setIsRecording(false);
  });

  // Handle speech recognition start
  useSpeechRecognitionEvent('start', () => {
    setIsRecording(true);
  });

  // Handle speech recognition end
  useSpeechRecognitionEvent('speechend', () => {
    // Speech has ended, but recognition might still be processing
  });

  // Handle final transcript
  const handleFinalTranscript = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;
    
    // Add user message
    addMessage(transcript);
    
    try {
      // Generate AI response
      const response = await generateResponse(transcript);
      
      // Add AI response
      if (response) {
        // Handle different response types
        let responseText: string;
        if (typeof response === 'string') {
          responseText = response;
        } else if (response && typeof response === 'object') {
          // Extract the text from the response object
          if (currentModelProvider === MODEL_PROVIDERS.PERPLEXITY) {
            const perplexityResponse = response.choices?.[0]?.message?.content || '';
            responseText = perplexityResponse.includes('</think>') 
              ? perplexityResponse.substring(perplexityResponse.indexOf('</think>') + 8) 
              : perplexityResponse;
          } else {
            responseText = response.choices?.[0]?.message?.content || 'No response content';
          }
        } else {
          responseText = 'Failed to generate AI response';
        }
        
        addMessage(responseText, false);
        
        // Speak the response
        speak(responseText, { language });
      }
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addMessage(`Sorry, I encountered an error: ${errorMessage}`, false);
    }
  }, [addMessage, generateResponse, language, currentModelProvider]);

  // Handle text input submission
  const handleSendText = useCallback(() => {
    const trimmedText = textInput.trim();
    if (!trimmedText) return;
    
    // Clear input field
    setTextInput('');
    
    // Process the text input
    handleFinalTranscript(trimmedText);
  }, [textInput, handleFinalTranscript]);

  const startRecording = useCallback(async () => {
    try {
      // Check if speech recognition is available
      const available = isRecognitionAvailable();
      
      if (!available) {
        addMessage('Speech recognition is not available on this device', false);
        return;
      }

      // Create a new SpeechRecognition instance
      const recognitionInstance = new ExpoWebSpeechRecognition();
      recognitionInstance.interimResults = true;
      recognitionInstance.continuous = false;
      
      // Set the language for speech recognition
      recognitionInstance.lang = language;
      
      setRecognition(recognitionInstance);
      recognitionInstance.start();
      
      // The 'start' event will set isRecording to true
    } catch (error) {
      console.error('Failed to start recording:', error);
      addMessage('Failed to start recording. Please try again.', false);
      setIsRecording(false);
    }
  }, [addMessage, language]);

  const stopRecording = useCallback(async () => {
    if (!isRecording || !recognition) return;

    try {
      // Stop speech recognition
      recognition.stop();
      setRecognition(null);
      setIsRecording(false);
      
      // If there's a current transcript that hasn't been processed yet
      if (currentTranscript) {
        handleFinalTranscript(currentTranscript);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      addMessage('Failed to stop recording', false);
      setIsRecording(false);
    }
  }, [isRecording, currentTranscript, handleFinalTranscript, addMessage, recognition]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (isRecording && recognition) {
        recognition.stop();
      }
    };
  }, [isRecording, recognition]);

  // Add a useEffect to monitor model changes
  useEffect(() => {
    console.log('Current model in component state:', currentModel);
    // This effect will run whenever the currentModel changes
    // The useAI hook will automatically update its internal state
  }, [currentModel]);

  // Show loading or error state
  useEffect(() => {
    const initializeAIService = async () => {
      if (isLoading) {
        addMessage('Initializing AI service...', false);
      } else if (error) {
        addMessage(`Error: ${error}. Please check your API key in settings.`, false);
      } else if (isInitialized && !aiServiceInitialized.current && currentThread) {
        aiServiceInitialized.current = true;
        addMessage(`AI service initialized with model: ${currentModel} (${currentModelProvider})`, false);
        addMessage(`Speech recognition language: ${language}`, false);
      }
    };

    initializeAIService();
  }, [isLoading, error, addMessage, isInitialized, currentModel, currentModelProvider, language, currentThread]);

  // Refresh when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Chat screen focused, refreshing data');
      aiServiceInitialized.current = false;
      
      let isMounted = true;
      
      const reloadSettings = async () => {
        if (!isMounted) return;
        
        try {
          // Load model first
          const storedModel = await getAIModel();
          console.log('Current stored model:', storedModel);
          
          if (storedModel !== currentModel && isMounted) {
            console.log('Model changed, updating to:', storedModel);
            setCurrentModel(storedModel);
          }
          
          // Load language
          const storedLanguage = await getLanguage();
          if (isMounted) setLanguage(storedLanguage);
          
          // Load thread ID and ensure thread exists
          const threadId = await getCurrentThreadId();
          console.log('Loading thread ID:', threadId);
          
          if (!isMounted) return;
          
          let thread = null;
          if (threadId) {
            thread = await getChatThreadById(threadId);
            console.log('Loaded thread:', thread?.id);
          }
          
          if (!thread) {
            console.log('No valid thread found, creating new one');
            thread = await createNewThread();
            console.log('Created new thread:', thread.id);
          }
          
          if (!isMounted) return;
          
          // Update thread state
          setCurrentThreadId(thread.id);
          setCurrentThread(thread);
          
          // Update messages
          if (thread.messages && thread.messages.length > 0) {
            const giftedMessages = thread.messages.map((msg): IMessage => ({
              _id: msg.id,
              text: msg.content,
              createdAt: new Date(msg.timestamp),
              user: {
                _id: msg.isUser ? 1 : 2,
                name: msg.isUser ? 'You' : 'AI Assistant',
                avatar: msg.isUser ? undefined : 'https://images.unsplash.com/photo-1531379410502-63bfe8cdaf6f?w=64&h=64&fit=crop&crop=faces',
              },
            }));
            setMessages(giftedMessages);
            console.log('Loaded', giftedMessages.length, 'messages');
          } else {
            const welcomeMessage: IMessage = {
              _id: 'welcome',
              text: `Welcome to a new conversation! You can ask me anything.`,
              createdAt: new Date(),
              user: {
                _id: 2,
                name: 'AI Assistant',
                avatar: 'https://images.unsplash.com/photo-1531379410502-63bfe8cdaf6f?w=64&h=64&fit=crop&crop=faces',
              },
            };
            setMessages([welcomeMessage]);
            console.log('Created welcome message');
          }
        } catch (error) {
          console.error('Error in reloadSettings:', error);
          if (isMounted) {
            // Create a new thread as fallback
            try {
              const newThread = await createNewThread();
              setCurrentThreadId(newThread.id);
              setCurrentThread(newThread);
              console.log('Created fallback thread:', newThread.id);
            } catch (fallbackError) {
              console.error('Failed to create fallback thread:', fallbackError);
            }
          }
        }
      };
      
      reloadSettings();
      
      return () => {
        console.log('Chat screen unfocused');
        isMounted = false;
      };
    }, [currentModel, createNewThread])
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.modelInfo}>
        <View style={styles.infoSection}>
          <Text style={styles.modelText}>
            Model: {currentModel}
          </Text>
          <TouchableOpacity
            style={styles.modelButton}
            onPress={() => router.push('/model-picker')}
          >
            <Text style={styles.modelButtonText}>Change</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.newThreadButton}
          onPress={async () => {
            try {
              await createNewThread();
              // No need to navigate since we're already on the chat screen
            } catch (error) {
              console.error('Failed to create new thread:', error);
              Alert.alert('Error', 'Failed to create new thread');
            }
          }}
        >
          <Plus size={16} color="#fff" />
          <Text style={styles.newThreadButtonText}>New Chat</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.threadInfo}>
        <Text style={styles.threadTitle} numberOfLines={1} ellipsizeMode="tail">
          {currentThread?.title || 'New Conversation'}
        </Text>
        <TouchableOpacity
          style={styles.threadsButton}
          onPress={() => router.push('/threads')}
        >
          <MessageSquare size={16} color="#007AFF" />
          <Text style={styles.threadsButtonText}>All Threads</Text>
        </TouchableOpacity>
      </View>

      <GiftedChat
        messages={messages}
        user={{ _id: 1 }}
        renderInputToolbar={() => null}
        inverted={true}
        renderAvatar={null}
      />

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

      {error ? (
        <TouchableOpacity
          style={styles.errorBanner}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.errorText}>API key not set. Tap to go to settings.</Text>
        </TouchableOpacity>
      ) : (
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
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modelText: {
    fontSize: 14,
    color: '#666',
  },
  modelButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  modelButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  newThreadButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  newThreadButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
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
  errorBanner: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  threadInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  threadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  threadsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  threadsButtonText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});