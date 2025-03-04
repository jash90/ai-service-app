import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

interface ErrorBannerProps {
  message?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message = 'API key not set. Tap to go to settings.'
}) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.errorBanner}
      onPress={() => router.push('/settings')}
    >
      <Text style={styles.errorText}>{message}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
}); 