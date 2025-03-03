import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Plus, Trash2, MessageSquare } from 'lucide-react-native';
import { getChatThreads, deleteChatThread, saveCurrentThreadId, ChatThread } from '../../src/services/storage';

export default function ThreadsScreen() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load threads
  const loadThreads = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedThreads = await getChatThreads();
      // Sort threads by updatedAt (newest first)
      storedThreads.sort((a, b) => b.updatedAt - a.updatedAt);
      setThreads(storedThreads);
    } catch (error) {
      console.error('Error loading threads:', error);
      Alert.alert('Error', 'Failed to load chat threads');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load threads on component mount and when screen comes into focus
  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useFocusEffect(
    useCallback(() => {
      loadThreads();
      return () => {};
    }, [loadThreads])
  );

  // Create a new thread
  const handleCreateThread = async () => {
    const newThread: ChatThread = {
      id: Date.now().toString(),
      title: `New Chat ${threads.length + 1}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: []
    };
    
    try {
      // Save the new thread ID as current
      await saveCurrentThreadId(newThread.id);
      // Navigate to the chat screen
      router.push('/');
    } catch (error) {
      console.error('Error creating new thread:', error);
      Alert.alert('Error', 'Failed to create new thread');
    }
  };

  // Select a thread
  const handleSelectThread = async (thread: ChatThread) => {
    try {
      console.log('Selecting thread:', thread.id);
      
      // Save the selected thread ID as current
      await saveCurrentThreadId(thread.id);
      console.log('Current thread ID set to:', thread.id);
      
      // Navigate to the chat screen
      router.push('/');
    } catch (error) {
      console.error('Error selecting thread:', error);
      Alert.alert('Error', 'Failed to select thread');
    }
  };

  // Delete a thread
  const handleDeleteThread = async (threadId: string) => {
    Alert.alert(
      'Delete Thread',
      'Are you sure you want to delete this thread? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteChatThread(threadId);
              // Refresh the list
              loadThreads();
            } catch (error) {
              console.error('Error deleting thread:', error);
              Alert.alert('Error', 'Failed to delete thread');
            }
          }
        }
      ]
    );
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render a thread item
  const renderThreadItem = ({ item }: { item: ChatThread }) => (
    <TouchableOpacity
      style={styles.threadItem}
      onPress={() => handleSelectThread(item)}
    >
      <View style={styles.threadInfo}>
        <MessageSquare size={20} color="#007AFF" style={styles.threadIcon} />
        <View style={styles.threadDetails}>
          <Text style={styles.threadTitle}>{item.title}</Text>
          <Text style={styles.threadDate}>
            {formatDate(item.updatedAt)}
          </Text>
          <Text style={styles.messageCount}>
            {item.messages.length} {item.messages.length === 1 ? 'message' : 'messages'}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteThread(item.id)}
      >
        <Trash2 size={20} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat Threads</Text>
        <TouchableOpacity
          style={styles.newThreadButton}
          onPress={handleCreateThread}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : threads.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MessageSquare size={48} color="#ccc" />
          <Text style={styles.emptyText}>No chat threads yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to start a new conversation
          </Text>
        </View>
      ) : (
        <FlatList
          data={threads}
          renderItem={renderThreadItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  newThreadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    color: '#333',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  threadItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  threadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  threadIcon: {
    marginRight: 12,
  },
  threadDetails: {
    flex: 1,
  },
  threadTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  threadDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  messageCount: {
    fontSize: 12,
    color: '#888',
  },
  deleteButton: {
    padding: 8,
  },
}); 