import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface ModelInfoProps {
  currentModel: string;
  onNewChat: () => void;
}

export const ModelInfo: React.FC<ModelInfoProps> = ({
  currentModel,
  onNewChat
}) => {
  const router = useRouter();

  return (
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
        onPress={onNewChat}
      >
        <Plus size={16} color="#fff" />
        <Text style={styles.newThreadButtonText}>New Chat</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
}); 