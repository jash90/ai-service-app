import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { 
  saveAIModel,
  getAIModel,
  AI_MODELS,
  AIModel,
  getDeepSeekApiKey,
  getPerplexityApiKey,
  MODEL_TO_PROVIDER,
  MODEL_PROVIDERS
} from '../src/services/storage';

export default function ModelPickerScreen() {
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS.GPT_3_5_TURBO);
  const [isLoading, setIsLoading] = useState(true);
  const [isModelSaving, setIsModelSaving] = useState(false);
  const [hasDeepSeekApiKey, setHasDeepSeekApiKey] = useState(false);
  const [hasPerplexityApiKey, setHasPerplexityApiKey] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load model on component mount
    const loadData = async () => {
      try {
        setIsLoading(true);
        const storedModel = await getAIModel();
        setSelectedModel(storedModel);
        
        // Check if API keys are set
        const deepSeekApiKey = await getDeepSeekApiKey();
        setHasDeepSeekApiKey(!!deepSeekApiKey);
        console.log('DeepSeek API key exists:', !!deepSeekApiKey);
        
        const perplexityApiKey = await getPerplexityApiKey();
        setHasPerplexityApiKey(!!perplexityApiKey);
        console.log('Perplexity API key exists:', !!perplexityApiKey);
        
        // Log the current model and its provider
        const provider = MODEL_TO_PROVIDER[storedModel];
        console.log(`Current model: ${storedModel}, provider: ${provider}`);
      } catch (error) {
        console.error('Error loading model:', error);
        Alert.alert('Error', 'Failed to load model settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSelectModel = async (model: AIModel) => {
    // Check if trying to select a model without API key
    const provider = MODEL_TO_PROVIDER[model];
    
    console.log(`Attempting to select model: ${model}, provider: ${provider}`);
    
    if (provider === MODEL_PROVIDERS.DEEPSEEK && !hasDeepSeekApiKey) {
      Alert.alert(
        'DeepSeek API Key Required',
        'You need to set a DeepSeek API key in Settings before using DeepSeek models.',
        [
          { 
            text: 'Go to Settings', 
            onPress: () => router.push('/settings')
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
      return;
    }
    
    if (provider === MODEL_PROVIDERS.PERPLEXITY && !hasPerplexityApiKey) {
      console.log('Perplexity API key not found, showing alert');
      Alert.alert(
        'Perplexity API Key Required',
        'You need to set a Perplexity API key in Settings before using Perplexity models.',
        [
          { 
            text: 'Go to Settings', 
            onPress: () => router.push('/settings')
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
      return;
    }
    
    try {
      console.log(`Saving model: ${model}`);
      setIsModelSaving(true);
      setSelectedModel(model);
      await saveAIModel(model);
      Alert.alert(
        'Success', 
        `Model changed to ${model}`,
        [
          { 
            text: 'OK', 
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error saving AI model:', error);
      Alert.alert('Error', 'Failed to save AI model');
    } finally {
      setIsModelSaving(false);
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
        <Text style={styles.headerTitle}>Select AI Model</Text>
        <Text style={styles.headerDescription}>
          Select the AI model to use for generating responses. More powerful models may provide better responses but can be more expensive.
        </Text>
      </View>
      
      {isModelSaving && (
        <ActivityIndicator style={styles.modelSavingIndicator} size="small" color="#007AFF" />
      )}

      <View style={styles.modelGroup}>
        <Text style={styles.modelGroupTitle}>GPT-3.5 Models</Text>
        <Text style={styles.modelGroupDescription}>
          Efficient models with good performance and lower cost
        </Text>
        
        {Object.entries(AI_MODELS)
          .filter(([key]) => key.startsWith('GPT_3_5'))
          .map(([key, model]) => (
            <TouchableOpacity
              key={`model-${key}`}
              style={[
                styles.modelOption,
                selectedModel === model && styles.selectedModelOption
              ]}
              onPress={() => handleSelectModel(model)}
              disabled={isModelSaving}
            >
              <View style={styles.modelOptionContent}>
                <Text style={[
                  styles.modelName,
                  selectedModel === model && styles.selectedModelText
                ]}>
                  {model}
                </Text>
                <Text style={styles.modelDescription}>
                  {getModelDescription(model)}
                </Text>
                <Text style={styles.modelCost}>
                  {getModelCostInfo(model)}
                </Text>
              </View>
              {selectedModel === model && (
                <View style={styles.selectedIndicator} />
              )}
            </TouchableOpacity>
          ))}
      </View>

      <View style={styles.modelGroup}>
        <Text style={styles.modelGroupTitle}>GPT-4 Models</Text>
        <Text style={styles.modelGroupDescription}>
          More advanced models with higher capabilities and cost
        </Text>
        
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ These models are significantly more expensive than GPT-3.5. Use with caution.
          </Text>
        </View>
        
        {Object.entries(AI_MODELS)
          .filter(([key]) => key.startsWith('GPT_4') && !key.startsWith('GPT_4O') && !key.startsWith('GPT_4_5'))
          .map(([key, model]) => (
            <TouchableOpacity
              key={`model-${key}`}
              style={[
                styles.modelOption,
                selectedModel === model && styles.selectedModelOption
              ]}
              onPress={() => handleSelectModel(model)}
              disabled={isModelSaving}
            >
              <View style={styles.modelOptionContent}>
                <Text style={[
                  styles.modelName,
                  selectedModel === model && styles.selectedModelText
                ]}>
                  {model}
                </Text>
                <Text style={styles.modelDescription}>
                  {getModelDescription(model)}
                </Text>
                <Text style={styles.modelCost}>
                  {getModelCostInfo(model)}
                </Text>
              </View>
              {selectedModel === model && (
                <View style={styles.selectedIndicator} />
              )}
            </TouchableOpacity>
          ))}
      </View>

      <View style={styles.modelGroup}>
        <Text style={styles.modelGroupTitle}>GPT-4o Models</Text>
        <Text style={styles.modelGroupDescription}>
          Latest generation models with best performance
        </Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            ℹ️ GPT-4o is the latest model from OpenAI with improved capabilities and better pricing than GPT-4.
          </Text>
        </View>
        
        {Object.entries(AI_MODELS)
          .filter(([key]) => key.startsWith('GPT_4O'))
          .map(([key, model]) => (
            <TouchableOpacity
              key={`model-${key}`}
              style={[
                styles.modelOption,
                selectedModel === model && styles.selectedModelOption
              ]}
              onPress={() => handleSelectModel(model)}
              disabled={isModelSaving}
            >
              <View style={styles.modelOptionContent}>
                <Text style={[
                  styles.modelName,
                  selectedModel === model && styles.selectedModelText
                ]}>
                  {model}
                </Text>
                <Text style={styles.modelDescription}>
                  {getModelDescription(model)}
                </Text>
                <Text style={styles.modelCost}>
                  {getModelCostInfo(model)}
                </Text>
              </View>
              {selectedModel === model && (
                <View style={styles.selectedIndicator} />
              )}
            </TouchableOpacity>
          ))}
      </View>

      <View style={styles.modelGroup}>
        <Text style={styles.modelGroupTitle}>Newest Models</Text>
        <Text style={styles.modelGroupDescription}>
          Cutting-edge models with advanced capabilities
        </Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            ℹ️ These are the newest models from OpenAI with state-of-the-art capabilities.
          </Text>
        </View>
        
        {Object.entries(AI_MODELS)
          .filter(([key]) => ['O1', 'O3_MINI', 'GPT_4_5_PREVIEW'].includes(key))
          .map(([key, model]) => (
            <TouchableOpacity
              key={`model-${key}`}
              style={[
                styles.modelOption,
                selectedModel === model && styles.selectedModelOption
              ]}
              onPress={() => handleSelectModel(model)}
              disabled={isModelSaving}
            >
              <View style={styles.modelOptionContent}>
                <Text style={[
                  styles.modelName,
                  selectedModel === model && styles.selectedModelText
                ]}>
                  {model}
                </Text>
                <Text style={styles.modelDescription}>
                  {getModelDescription(model)}
                </Text>
                <Text style={styles.modelCost}>
                  {getModelCostInfo(model)}
                </Text>
              </View>
              {selectedModel === model && (
                <View style={styles.selectedIndicator} />
              )}
            </TouchableOpacity>
          ))}
      </View>

      <View style={styles.modelGroup}>
        <Text style={styles.modelGroupTitle}>DeepSeek Models</Text>
        <Text style={styles.modelGroupDescription}>
          High-performance models from DeepSeek
        </Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            ℹ️ DeepSeek models require a separate API key. Make sure to set it in the API settings.
          </Text>
        </View>
        
        {!hasDeepSeekApiKey && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              ⚠️ DeepSeek API key is not set. Go to Settings to add your API key.
            </Text>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => router.push('/settings')}
            >
              <Text style={styles.settingsButtonText}>Go to Settings</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {Object.entries(AI_MODELS)
          .filter(([key]) => key.startsWith('DEEPSEEK'))
          .map(([key, model]) => (
            <TouchableOpacity
              key={`model-${key}`}
              style={[
                styles.modelOption,
                selectedModel === model && styles.selectedModelOption,
                !hasDeepSeekApiKey && styles.disabledModelOption
              ]}
              onPress={() => handleSelectModel(model)}
              disabled={isModelSaving || !hasDeepSeekApiKey}
            >
              <View style={styles.modelOptionContent}>
                <Text style={[
                  styles.modelName,
                  selectedModel === model && styles.selectedModelText,
                  !hasDeepSeekApiKey && styles.disabledModelText
                ]}>
                  {model}
                </Text>
                <Text style={[
                  styles.modelDescription,
                  !hasDeepSeekApiKey && styles.disabledModelText
                ]}>
                  {getModelDescription(model)}
                </Text>
                <Text style={[
                  styles.modelCost,
                  !hasDeepSeekApiKey && styles.disabledModelText
                ]}>
                  {getModelCostInfo(model)}
                </Text>
              </View>
              {selectedModel === model && (
                <View style={styles.selectedIndicator} />
              )}
            </TouchableOpacity>
          ))}
      </View>

      <View style={styles.modelGroup}>
        <Text style={styles.modelGroupTitle}>Perplexity Models</Text>
        <Text style={styles.modelGroupDescription}>
          Real-time knowledge and research models from Perplexity AI
        </Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            ℹ️ Perplexity models require a separate API key. Make sure to set it in the API settings.
          </Text>
        </View>
        
        {!hasPerplexityApiKey && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              ⚠️ Perplexity API key is not set. Go to Settings to add your API key.
            </Text>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => router.push('/settings')}
            >
              <Text style={styles.settingsButtonText}>Go to Settings</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {Object.entries(AI_MODELS)
          .filter(([key]) => key.startsWith('PERPLEXITY'))
          .map(([key, model]) => (
            <TouchableOpacity
              key={`model-${key}`}
              style={[
                styles.modelOption,
                selectedModel === model && styles.selectedModelOption,
                !hasPerplexityApiKey && styles.disabledModelOption
              ]}
              onPress={() => handleSelectModel(model)}
              disabled={isModelSaving || !hasPerplexityApiKey}
            >
              <View style={styles.modelOptionContent}>
                <Text style={[
                  styles.modelName,
                  selectedModel === model && styles.selectedModelText,
                  !hasPerplexityApiKey && styles.disabledModelText
                ]}>
                  {model}
                </Text>
                <Text style={[
                  styles.modelDescription,
                  !hasPerplexityApiKey && styles.disabledModelText
                ]}>
                  {getModelDescription(model)}
                </Text>
                <Text style={[
                  styles.modelCost,
                  !hasPerplexityApiKey && styles.disabledModelText
                ]}>
                  {getModelCostInfo(model)}
                </Text>
              </View>
              {selectedModel === model && (
                <View style={styles.selectedIndicator} />
              )}
            </TouchableOpacity>
          ))}
      </View>
    </ScrollView>
  );
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
  modelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedModelOption: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  modelOptionContent: {
    flex: 1,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedModelText: {
    color: '#007AFF',
  },
  modelDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  modelCost: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  selectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  modelSavingIndicator: {
    marginBottom: 12,
  },
  modelGroup: {
    marginBottom: 24,
  },
  modelGroupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 8,
  },
  modelGroupDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  warningContainer: {
    backgroundColor: 'rgba(255, 204, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 204, 0, 0.5)',
  },
  warningText: {
    fontSize: 13,
    color: '#996600',
    fontWeight: '500',
    marginBottom: 12,
  },
  infoContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.5)',
  },
  infoText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  settingsButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  disabledModelOption: {
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
    borderColor: '#e0e0e0',
  },
  disabledModelText: {
    color: 'rgba(100, 100, 100, 0.5)',
  },
}); 