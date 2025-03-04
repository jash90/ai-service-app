import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface ThreadInfoProps {
  title: string;
}

export const ThreadInfo: React.FC<ThreadInfoProps> = ({ title }) => {
  const router = useRouter();

  return (
    <View style={styles.threadInfo}>
      <Text style={styles.threadTitle} numberOfLines={1} ellipsizeMode="tail">
        {title || 'New Conversation'}
      </Text>
      <TouchableOpacity
        style={styles.threadsButton}
        onPress={() => router.push('/threads')}
      >
        <MessageSquare size={16} color="#007AFF" />
        <Text style={styles.threadsButtonText}>All Threads</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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