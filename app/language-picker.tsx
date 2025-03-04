import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { 
  saveLanguage,
  getLanguage,
  LANGUAGES,
  Language,
} from '../services/storage';

export default function LanguagePickerScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES.ENGLISH_US);
  const [isLoading, setIsLoading] = useState(true);
  const [isLanguageSaving, setIsLanguageSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load language on component mount
    const loadData = async () => {
      try {
        setIsLoading(true);
        const storedLanguage = await getLanguage();
        setSelectedLanguage(storedLanguage);
      } catch (error) {
        console.error('Error loading language:', error);
        Alert.alert('Error', 'Failed to load language settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSelectLanguage = async (language: Language) => {
    try {
      setIsLanguageSaving(true);
      setSelectedLanguage(language);
      await saveLanguage(language);
      Alert.alert(
        'Success', 
        `Language changed to ${getLanguageDisplayName(language)}`,
        [
          { 
            text: 'OK', 
            onPress: () => router.back() 
          }
        ]
      );
    } catch (error) {
      console.error('Error saving language:', error);
      Alert.alert('Error', 'Failed to save language');
    } finally {
      setIsLanguageSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Language</Text>
        <Text style={styles.headerDescription}>
          Select the language for speech recognition and text-to-speech.
        </Text>
      </View>
      
      {isLanguageSaving && (
        <ActivityIndicator style={styles.languageSavingIndicator} size="small" color="#007AFF" />
      )}

      <View style={styles.languageGroup}>
        <Text style={styles.languageGroupTitle}>English</Text>
        
        {Object.entries(LANGUAGES)
          .filter(([key]) => key.startsWith('ENGLISH'))
          .map(([key, language]) => (
            <TouchableOpacity
              key={`language-${key}`}
              style={[
                styles.languageOption,
                selectedLanguage === language && styles.selectedLanguageOption
              ]}
              onPress={() => handleSelectLanguage(language)}
              disabled={isLanguageSaving}
            >
              <View style={styles.languageOptionContent}>
                <Text style={[
                  styles.languageName,
                  selectedLanguage === language && styles.selectedLanguageText
                ]}>
                  {getLanguageDisplayName(language)}
                </Text>
                <Text style={styles.languageDescription}>
                  {getLanguageDescription(language)}
                </Text>
              </View>
              {selectedLanguage === language && (
                <View style={styles.selectedIndicator} />
              )}
            </TouchableOpacity>
          ))}
      </View>

      <View style={styles.languageGroup}>
        <Text style={styles.languageGroupTitle}>European Languages</Text>
        
        {Object.entries(LANGUAGES)
          .filter(([key]) => ['FRENCH', 'GERMAN', 'ITALIAN', 'SPANISH', 'PORTUGUESE', 'POLISH', 'RUSSIAN'].includes(key))
          .map(([key, language]) => (
            <TouchableOpacity
              key={`language-${key}`}
              style={[
                styles.languageOption,
                selectedLanguage === language && styles.selectedLanguageOption
              ]}
              onPress={() => handleSelectLanguage(language)}
              disabled={isLanguageSaving}
            >
              <View style={styles.languageOptionContent}>
                <Text style={[
                  styles.languageName,
                  selectedLanguage === language && styles.selectedLanguageText
                ]}>
                  {getLanguageDisplayName(language)}
                </Text>
                <Text style={styles.languageDescription}>
                  {getLanguageDescription(language)}
                </Text>
              </View>
              {selectedLanguage === language && (
                <View style={styles.selectedIndicator} />
              )}
            </TouchableOpacity>
          ))}
      </View>

      <View style={styles.languageGroup}>
        <Text style={styles.languageGroupTitle}>Asian Languages</Text>
        
        {Object.entries(LANGUAGES)
          .filter(([key]) => ['JAPANESE', 'KOREAN', 'CHINESE'].includes(key))
          .map(([key, language]) => (
            <TouchableOpacity
              key={`language-${key}`}
              style={[
                styles.languageOption,
                selectedLanguage === language && styles.selectedLanguageOption
              ]}
              onPress={() => handleSelectLanguage(language)}
              disabled={isLanguageSaving}
            >
              <View style={styles.languageOptionContent}>
                <Text style={[
                  styles.languageName,
                  selectedLanguage === language && styles.selectedLanguageText
                ]}>
                  {getLanguageDisplayName(language)}
                </Text>
                <Text style={styles.languageDescription}>
                  {getLanguageDescription(language)}
                </Text>
              </View>
              {selectedLanguage === language && (
                <View style={styles.selectedIndicator} />
              )}
            </TouchableOpacity>
          ))}
      </View>
    </ScrollView>
  );
}

// Helper function to get language display names
function getLanguageDisplayName(language: Language): string {
  switch (language) {
    case LANGUAGES.ENGLISH_US:
      return 'English (US)';
    case LANGUAGES.ENGLISH_UK:
      return 'English (UK)';
    case LANGUAGES.POLISH:
      return 'Polish';
    case LANGUAGES.SPANISH:
      return 'Spanish';
    case LANGUAGES.FRENCH:
      return 'French';
    case LANGUAGES.GERMAN:
      return 'German';
    case LANGUAGES.ITALIAN:
      return 'Italian';
    case LANGUAGES.PORTUGUESE:
      return 'Portuguese';
    case LANGUAGES.RUSSIAN:
      return 'Russian';
    case LANGUAGES.JAPANESE:
      return 'Japanese';
    case LANGUAGES.KOREAN:
      return 'Korean';
    case LANGUAGES.CHINESE:
      return 'Chinese';
    default:
      return language;
  }
}

// Helper function to get language descriptions
function getLanguageDescription(language: Language): string {
  switch (language) {
    case LANGUAGES.ENGLISH_US:
      return 'American English accent and recognition';
    case LANGUAGES.ENGLISH_UK:
      return 'British English accent and recognition';
    case LANGUAGES.POLISH:
      return 'Polish language support';
    case LANGUAGES.SPANISH:
      return 'Spanish (Spain) language support';
    case LANGUAGES.FRENCH:
      return 'French language support';
    case LANGUAGES.GERMAN:
      return 'German language support';
    case LANGUAGES.ITALIAN:
      return 'Italian language support';
    case LANGUAGES.PORTUGUESE:
      return 'Portuguese (Brazil) language support';
    case LANGUAGES.RUSSIAN:
      return 'Russian language support';
    case LANGUAGES.JAPANESE:
      return 'Japanese language support';
    case LANGUAGES.KOREAN:
      return 'Korean language support';
    case LANGUAGES.CHINESE:
      return 'Mandarin Chinese language support';
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedLanguageOption: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  languageOptionContent: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedLanguageText: {
    color: '#007AFF',
  },
  languageDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  selectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  languageSavingIndicator: {
    marginBottom: 12,
  },
  languageGroup: {
    marginBottom: 24,
  },
  languageGroupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 16,
  },
}); 