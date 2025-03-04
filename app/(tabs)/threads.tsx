import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Plus, Trash2, MessageSquare } from 'lucide-react-native';
import { getChatThreads, deleteChatThread, saveCurrentThreadId, ChatThread } from '../../services/storage';

export default function ThreadsScreen() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadThreads = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedThreads = await getChatThreads();
      storedThreads.sort((a, b) => b.updatedAt - a.updatedAt);
      setThreads(storedThreads);
    } catch (error) {
      Alert.alert('Error', 'Failed to load chat threads');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadThreads();
    }, [loadThreads])
  );

  const handleCreateThread = async () => {
    const newThread: ChatThread = {
      id: Date.now().toString(),
      title: `New Chat ${threads.length + 1}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: []
    };
    
    try {
      await saveCurrentThreadId(newThread.id);
      router.push('/');
    } catch (error) {
      Alert.alert('Error', 'Failed to create new thread');
    }
  };

  const handleSelectThread = async (thread: ChatThread) => {
    try {
      await saveCurrentThreadId(thread.id);
      router.push('/');
    } catch (error) {
      Alert.alert('Error', 'Failed to select thread');
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    Alert.alert(
      'Delete Thread',
      'Are you sure you want to delete this thread? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteChatThread(threadId);
              loadThreads();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete thread');
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateThread}>
        <Plus size={24} color="#fff" />
        <Text style={styles.createButtonText}>New Thread</Text>
      </TouchableOpacity>

      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.threadItem}
            onPress={() => handleSelectThread(item)}
          >
            <View style={styles.threadInfo}>
              <MessageSquare size={24} color="#007AFF" />
              <View style={styles.threadDetails}>
                <Text style={styles.threadTitle}>{item.title}</Text>
                <Text style={styles.threadDate}>{formatDate(item.updatedAt)}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteThread(item.id)}
            >
              <Trash2 size={20} color="#FF3B30" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  threadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    marginBottom: 8,
  },
  threadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  threadDetails: {
    marginLeft: 12,
    flex: 1,
  },
  threadTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  threadDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
}); 