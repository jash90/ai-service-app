import { View, Text, StyleSheet, Switch, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { 
  saveApiKey, 
  getApiKey, 
  saveSettings, 
  getSettings, 
  AppSettings, 
  DEFAULT_SETTINGS,
  saveAIModel,
  getAIModel,
  AI_MODELS,
  AIModel,
  LANGUAGES,
  Language,
  getLanguage,
  saveLanguage,
  DEFAULT_LANGUAGE,
  saveDeepSeekApiKey,
  getDeepSeekApiKey,
  MODEL_TO_PROVIDER,
  MODEL_PROVIDERS,
  savePerplexityApiKey,
  getPerplexityApiKey
} from '../../services/storage';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [apiKey, setApiKey] = useState('');
  const [deepSeekApiKey, setDeepSeekApiKey] = useState('');
  const [perplexityApiKey, setPerplexityApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS.GPT_3_5_TURBO);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeepSeekSaving, setIsDeepSeekSaving] = useState(false);
  const [isPerplexitySaving, setIsPerplexitySaving] = useState(false);
  const [isModelSaving, setIsModelSaving] = useState(false);
  const [isLanguageSaving, setIsLanguageSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showDeepSeekApiKey, setShowDeepSeekApiKey] = useState(false);
  const [showPerplexityApiKey, setShowPerplexityApiKey] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load settings and API key on component mount
    const loadData = async () => {
      try {
        setIsLoading(true);
        const storedSettings = await getSettings();
        const storedApiKey = await getApiKey();
        const storedDeepSeekApiKey = await getDeepSeekApiKey();
        const storedPerplexityApiKey = await getPerplexityApiKey();
        const storedModel = await getAIModel();
        const storedLanguage = await getLanguage();
        
        setSettings(storedSettings);
        setApiKey(storedApiKey || '');
        setDeepSeekApiKey(storedDeepSeekApiKey || '');
        setPerplexityApiKey(storedPerplexityApiKey || '');
        setSelectedModel(storedModel);
        setSelectedLanguage(storedLanguage);
      } catch (error) {
        console.error('Error loading settings:', error);
        Alert.alert('Error', 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleSetting = async (key: keyof AppSettings) => {
    try {
      const newSettings = {
        ...settings,
        [key]: !settings[key],
      };
      
      setSettings(newSettings);
      await saveSettings(newSettings);
    } catch (error) {
      console.error('Error saving setting:', error);
      Alert.alert('Error', 'Failed to save setting');
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter a valid API key');
      return;
    }

    try {
      setIsSaving(true);
      await saveApiKey(apiKey.trim());
      Alert.alert('Success', 'OpenAI API key saved successfully');
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Error', 'Failed to save API key');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDeepSeekApiKey = async () => {
    if (!deepSeekApiKey.trim()) {
      Alert.alert('Error', 'Please enter a valid DeepSeek API key');
      return;
    }

    try {
      setIsDeepSeekSaving(true);
      await saveDeepSeekApiKey(deepSeekApiKey.trim());
      Alert.alert('Success', 'DeepSeek API key saved successfully');
    } catch (error) {
      console.error('Error saving DeepSeek API key:', error);
      Alert.alert('Error', 'Failed to save DeepSeek API key');
    } finally {
      setIsDeepSeekSaving(false);
    }
  };

  const handleSavePerplexityApiKey = async () => {
    if (!perplexityApiKey.trim()) {
      Alert.alert('Error', 'Please enter a valid Perplexity API key');
      return;
    }

    try {
      console.log('Saving Perplexity API key...');
      setIsPerplexitySaving(true);
      await savePerplexityApiKey(perplexityApiKey.trim());
      console.log('Perplexity API key saved successfully');
      Alert.alert('Success', 'Perplexity API key saved successfully');
    } catch (error) {
      console.error('Error saving Perplexity API key:', error);
      Alert.alert('Error', 'Failed to save Perplexity API key');
    } finally {
      setIsPerplexitySaving(false);
    }
  };

  const handleSelectModel = async (model: AIModel) => {
    try {
      setIsModelSaving(true);
      setSelectedModel(model);
      await saveAIModel(model);
      Alert.alert('Success', `Model changed to ${model}`);
    } catch (error) {
      console.error('Error saving AI model:', error);
      Alert.alert('Error', 'Failed to save AI model');
    } finally {
      setIsModelSaving(false);
    }
  };

  const handleSelectLanguage = async (language: Language) => {
    try {
      setIsLanguageSaving(true);
      setSelectedLanguage(language);
      await saveLanguage(language);
      Alert.alert('Success', `Language changed to ${getLanguageDisplayName(language)}`);
    } catch (error) {
      console.error('Error saving language:', error);
      Alert.alert('Error', 'Failed to save language');
    } finally {
      setIsLanguageSaving(false);
    }
  };

  const navigateToModelPicker = () => {
    router.push('/model-picker');
  };

  const navigateToLanguagePicker = () => {
    router.push('/language-picker');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Get the provider for the currently selected model
  const currentModelProvider = MODEL_TO_PROVIDER[selectedModel] || MODEL_PROVIDERS.OPENAI;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Settings</Text>
        <View style={styles.apiKeyContainer}>
          <Text style={styles.settingLabel}>OpenAI API Key</Text>
          <TextInput
            style={styles.apiKeyInput}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="Enter your OpenAI API key"
            secureTextEntry={!showApiKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.apiKeyActions}>
            <TouchableOpacity 
              style={styles.toggleButton} 
              onPress={() => setShowApiKey(!showApiKey)}
            >
              <Text style={styles.toggleButtonText}>
                {showApiKey ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSaveApiKey}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.apiKeyHelp}>
            You can get your API key from the OpenAI dashboard at https://platform.openai.com/api-keys
          </Text>
        </View>

        <View style={[styles.apiKeyContainer, { marginTop: 20 }]}>
          <Text style={styles.settingLabel}>DeepSeek API Key</Text>
          <TextInput
            style={styles.apiKeyInput}
            value={deepSeekApiKey}
            onChangeText={setDeepSeekApiKey}
            placeholder="Enter your DeepSeek API key"
            secureTextEntry={!showDeepSeekApiKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.apiKeyActions}>
            <TouchableOpacity 
              style={styles.toggleButton} 
              onPress={() => setShowDeepSeekApiKey(!showDeepSeekApiKey)}
            >
              <Text style={styles.toggleButtonText}>
                {showDeepSeekApiKey ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSaveDeepSeekApiKey}
              disabled={isDeepSeekSaving}
            >
              {isDeepSeekSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.apiKeyHelp}>
            Required for using DeepSeek models. Get your API key from the DeepSeek platform.
          </Text>
          
          {currentModelProvider === MODEL_PROVIDERS.DEEPSEEK && !deepSeekApiKey && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                ⚠️ You have selected a DeepSeek model but haven't set a DeepSeek API key yet.
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.apiKeyContainer, { marginTop: 20 }]}>
          <Text style={styles.settingLabel}>Perplexity API Key</Text>
          <TextInput
            style={styles.apiKeyInput}
            value={perplexityApiKey}
            onChangeText={setPerplexityApiKey}
            placeholder="Enter your Perplexity API key"
            secureTextEntry={!showPerplexityApiKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.apiKeyActions}>
            <TouchableOpacity 
              style={styles.toggleButton} 
              onPress={() => setShowPerplexityApiKey(!showPerplexityApiKey)}
            >
              <Text style={styles.toggleButtonText}>
                {showPerplexityApiKey ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSavePerplexityApiKey}
              disabled={isPerplexitySaving}
            >
              {isPerplexitySaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.apiKeyHelp}>
            Required for using Perplexity models. Get your API key from the Perplexity AI platform.
          </Text>
          
          {currentModelProvider === MODEL_PROVIDERS.PERPLEXITY && !perplexityApiKey && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                ⚠️ You have selected a Perplexity model but haven't set a Perplexity API key yet.
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language Settings</Text>
        <Text style={styles.settingDescription}>
          Select the language for speech recognition and text-to-speech.
        </Text>
        
        <TouchableOpacity 
          style={styles.navigationOption}
          onPress={navigateToLanguagePicker}
        >
          <View style={styles.navigationOptionContent}>
            <Text style={styles.navigationOptionTitle}>Language</Text>
            <Text style={styles.navigationOptionValue}>
              {getLanguageDisplayName(selectedLanguage)}
            </Text>
          </View>
          <Text style={styles.navigationArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Model</Text>
        <Text style={styles.settingDescription}>
          Select the AI model to use for generating responses.
        </Text>
        
        <TouchableOpacity 
          style={styles.navigationOption}
          onPress={navigateToModelPicker}
        >
          <View style={styles.navigationOptionContent}>
            <Text style={styles.navigationOptionTitle}>Model</Text>
            <Text style={styles.navigationOptionValue}>
              {selectedModel}
            </Text>
          </View>
          <Text style={styles.navigationArrow}>›</Text>
        </TouchableOpacity>
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

// Helper function to get model descriptions
function getModelDescription(model: AIModel): string {
  switch (model) {
    case AI_MODELS.GPT_3_5_TURBO:
      return 'Fast and cost-effective model for most everyday tasks';
    case AI_MODELS.GPT_3_5_TURBO_16K:
      return 'GPT-3.5 with extended 16K token context window';
    case AI_MODELS.GPT_4:
      return 'Advanced reasoning and knowledge with 8K context window';
    case AI_MODELS.GPT_4_TURBO:
      return 'Improved GPT-4 with 128K context window and updated knowledge';
    case AI_MODELS.GPT_4_32K:
      return 'GPT-4 with extended 32K token context window';
    case AI_MODELS.GPT_4_VISION:
      return 'GPT-4 with the ability to understand and analyze images';
    case AI_MODELS.GPT_4O:
      return 'Latest GPT-4 model with improved reasoning and knowledge';
    case AI_MODELS.GPT_4O_MINI:
      return 'Smaller, faster version of GPT-4o with excellent capabilities';
    case AI_MODELS.GPT_4_5_PREVIEW:
      return 'Preview of GPT-4.5 with enhanced capabilities';
    case AI_MODELS.O1:
      return 'OpenAI\'s most advanced model with superior reasoning';
    case AI_MODELS.O3_MINI:
      return 'Compact version of O-series models with excellent performance';
    case AI_MODELS.DEEPSEEK_CHAT:
      return 'General-purpose chat model from DeepSeek with strong reasoning abilities';
    case AI_MODELS.DEEPSEEK_REASONER:
      return 'DeepSeek Reasoner is optimized for complex reasoning tasks with enhanced problem-solving capabilities.';
    case AI_MODELS.PERPLEXITY_SONAR_DEEP_RESEARCH:
      return 'Sonar Deep Research is Perplexity\'s most powerful model for in-depth research and complex knowledge tasks.';
    case AI_MODELS.PERPLEXITY_SONAR_REASONING_PRO:
      return 'Sonar Reasoning Pro offers enhanced reasoning capabilities with professional-grade performance.';
    case AI_MODELS.PERPLEXITY_SONAR_REASONING:
      return 'Sonar Reasoning is optimized for logical reasoning and problem-solving tasks.';
    case AI_MODELS.PERPLEXITY_SONAR_PRO:
      return 'Sonar Pro is a professional-grade model with 200k context window for comprehensive analysis.';
    case AI_MODELS.PERPLEXITY_SONAR:
      return 'Sonar is Perplexity\'s general-purpose model with strong knowledge retrieval capabilities.';
    case AI_MODELS.PERPLEXITY_R1_1776:
      return 'R1-1776 is a specialized model with 128k context window for diverse tasks.';
    default:
      return '';
  }
}

// Helper function to get model cost information
function getModelCostInfo(model: AIModel): string {
  switch (model) {
    case AI_MODELS.GPT_3_5_TURBO:
      return 'Cost: $0.0015 / 1K tokens';
    case AI_MODELS.GPT_3_5_TURBO_16K:
      return 'Cost: $0.003 / 1K tokens';
    case AI_MODELS.GPT_4:
      return 'Cost: $0.03 / 1K tokens';
    case AI_MODELS.GPT_4_TURBO:
      return 'Cost: $0.01 / 1K tokens';
    case AI_MODELS.GPT_4_32K:
      return 'Cost: $0.06 / 1K tokens';
    case AI_MODELS.GPT_4_VISION:
      return 'Cost: $0.01 / 1K tokens';
    case AI_MODELS.GPT_4O:
      return 'Cost: $0.005 / 1K tokens';
    case AI_MODELS.GPT_4O_MINI:
      return 'Cost: $0.002 / 1K tokens';
    case AI_MODELS.GPT_4_5_PREVIEW:
      return 'Cost: $0.015 / 1K tokens';
    case AI_MODELS.O1:
      return 'Cost: $0.025 / 1K tokens';
    case AI_MODELS.O3_MINI:
      return 'Cost: $0.008 / 1K tokens';
    case AI_MODELS.DEEPSEEK_CHAT:
      return 'Cost: $0.07 / 1M tokens';
    case AI_MODELS.DEEPSEEK_REASONER:
      return 'Cost: $0.14 / 1M tokens';
    case AI_MODELS.PERPLEXITY_SONAR_DEEP_RESEARCH:
      return 'Cost: $0.0020 / 1K tokens';
    case AI_MODELS.PERPLEXITY_SONAR_REASONING_PRO:
      return 'Cost: $0.0018 / 1K tokens';
    case AI_MODELS.PERPLEXITY_SONAR_REASONING:
      return 'Cost: $0.0012 / 1K tokens';
    case AI_MODELS.PERPLEXITY_SONAR_PRO:
      return 'Cost: $0.0016 / 1K tokens';
    case AI_MODELS.PERPLEXITY_SONAR:
      return 'Cost: $0.0008 / 1K tokens';
    case AI_MODELS.PERPLEXITY_R1_1776:
      return 'Cost: $0.0010 / 1K tokens';
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 16,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  settingLabel: {
    fontSize: 16,
    color: '#1c1c1e',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  apiKeyContainer: {
    marginBottom: 16,
  },
  apiKeyInput: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    fontSize: 16,
  },
  apiKeyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  toggleButton: {
    padding: 8,
    marginRight: 8,
  },
  toggleButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  apiKeyHelp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  navigationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  navigationOptionContent: {
    flex: 1,
  },
  navigationOptionTitle: {
    fontSize: 16,
    color: '#1c1c1e',
    marginBottom: 4,
  },
  navigationOptionValue: {
    fontSize: 14,
    color: '#666',
  },
  navigationArrow: {
    fontSize: 24,
    color: '#c7c7cc',
    marginLeft: 8,
  },
  warningContainer: {
    padding: 12,
    backgroundColor: '#ffd700',
    borderRadius: 8,
    marginTop: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
});