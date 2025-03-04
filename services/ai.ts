import { OpenAI } from 'openai';
import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  getApiKey,
  getAIModel,
  AIModel,
  DEFAULT_AI_MODEL,
  MODEL_TO_PROVIDER,
  MODEL_PROVIDERS,
  getDeepSeekApiKey,
  getApiKeyForModel,
  getPerplexityApiKey
} from './storage';
import { ChatCompletionMessageParam } from 'openai/resources';

// Create a configurable OpenAI instance
const createOpenAIClient = (apiKey: string) => {
  return new OpenAI({
    apiKey: apiKey
  });
};

// Create a DeepSeek client (using OpenAI compatible API)
const createDeepSeekClient = (apiKey: string) => {
  return new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.deepseek.com'
  });
};

// Create a Perplexity client (using OpenAI compatible API)
const createPerplexityClient = (apiKey: string) => {
  console.log('Creating Perplexity client...');
  return new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.perplexity.ai',
    defaultHeaders: {
      'Content-Type': 'application/json',
    }
  });
};

export function useAI() {
  const [openaiClient, setOpenaiClient] = useState<OpenAI | null>(null);
  const [deepseekClient, setDeepseekClient] = useState<OpenAI | null>(null);
  const [perplexityClient, setPerplexityClient] = useState<OpenAI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<AIModel>(DEFAULT_AI_MODEL);
  const [apiKeysLoaded, setApiKeysLoaded] = useState(false);

  // Function to initialize AI clients
  const initializeAIClients = useCallback(async () => {
    try {
      setIsLoading(true);
      // Try to get the API keys from storage
      const openaiApiKey = await getApiKey();
      const deepseekApiKey = await getDeepSeekApiKey();
      const perplexityApiKey = await getPerplexityApiKey();

      console.log('API Keys loaded:');
      console.log('OpenAI API Key exists:', !!openaiApiKey);
      console.log('DeepSeek API Key exists:', !!deepseekApiKey);
      console.log('Perplexity API Key exists:', !!perplexityApiKey);

      // Try to get the AI model from storage
      const storedModel = await getAIModel();
      console.log('Current model:', storedModel);

      // Initialize OpenAI client if key exists
      if (openaiApiKey) {
        const client = createOpenAIClient(openaiApiKey);
        setOpenaiClient(client);
      } else {
        console.warn('No OpenAI API key found');
        setOpenaiClient(null);
      }

      // Initialize DeepSeek client if key exists
      if (deepseekApiKey) {
        const client = createDeepSeekClient(deepseekApiKey);
        setDeepseekClient(client);
      } else {
        console.warn('No DeepSeek API key found');
        setDeepseekClient(null);
      }

      // Initialize Perplexity client if key exists
      if (perplexityApiKey) {
        console.log('Initializing Perplexity client with key');
        const client = createPerplexityClient(perplexityApiKey);
        setPerplexityClient(client);
      } else {
        console.warn('No Perplexity API key found');
        setPerplexityClient(null);
      }

      setCurrentModel(storedModel);
      setApiKeysLoaded(true);

      // Check if we have the necessary API key for the current model
      const modelProvider = MODEL_TO_PROVIDER[storedModel] || MODEL_PROVIDERS.OPENAI;
      console.log('Current model provider:', modelProvider);

      if ((modelProvider === MODEL_PROVIDERS.OPENAI && !openaiApiKey) ||
        (modelProvider === MODEL_PROVIDERS.DEEPSEEK && !deepseekApiKey) ||
        (modelProvider === MODEL_PROVIDERS.PERPLEXITY && !perplexityApiKey)) {
        setError(`No API key found for ${modelProvider}. Please add your API key in settings.`);
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Failed to initialize AI services:', err);
      setError('Failed to initialize AI services');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize on first load
  useEffect(() => {
    initializeAIClients();
  }, [initializeAIClients]);

  // Refresh clients when returning to the app
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && apiKeysLoaded) {
        // Refresh clients when app comes to foreground
        console.log('App came to foreground, refreshing AI clients');

        // Check if model has changed
        const storedModel = await getAIModel();
        if (storedModel !== currentModel) {
          console.log(`Model changed from ${currentModel} to ${storedModel}, updating...`);
          setCurrentModel(storedModel);
        }

        initializeAIClients();
      }
    };

    // Add event listener for app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      // Clean up the listener
      subscription.remove();
    };
  }, [apiKeysLoaded, initializeAIClients, currentModel]);

  const getClientForModel = (model: AIModel) => {
    const provider = MODEL_TO_PROVIDER[model] || MODEL_PROVIDERS.OPENAI;
    console.log(`Getting client for model: ${model}, provider: ${provider}`);

    if (provider === MODEL_PROVIDERS.DEEPSEEK) {
      if (!deepseekClient) {
        console.error('DeepSeek client not initialized');
        throw new Error('DeepSeek client not initialized. Please add your DeepSeek API key in settings.');
      }
      return deepseekClient;
    } else if (provider === MODEL_PROVIDERS.PERPLEXITY) {
      console.log('Using Perplexity client, initialized:', !!perplexityClient);
      if (!perplexityClient) {
        console.error('Perplexity client not initialized');
        throw new Error('Perplexity client not initialized. Please add your Perplexity API key in settings.');
      }
      return perplexityClient;
    } else {
      if (!openaiClient) {
        console.error('OpenAI client not initialized');
        throw new Error('OpenAI client not initialized. Please add your OpenAI API key in settings.');
      }
      return openaiClient;
    }
  };

  const generateResponse = async (prompt: string, model?: AIModel) => {
    const modelToUse = model || currentModel;
    const client = getClientForModel(modelToUse);
    const provider = MODEL_TO_PROVIDER[modelToUse] || MODEL_PROVIDERS.OPENAI;

    try {
      console.log(`Generating response with model: ${modelToUse}, provider: ${provider}`);

      // Create properly typed messages
      let messages: ChatCompletionMessageParam[];

      if (provider === MODEL_PROVIDERS.PERPLEXITY) {
        // For Perplexity, the last message must have role 'user'
        console.log('Using Perplexity-specific message format');
        messages = [
          { role: 'user', content: prompt }
        ];
      } else {
        // For other providers, we can include the assistant message
        messages = [
          { role: 'assistant', content: 'You are a helpful assistant that provides concise and relevant responses.' },
          { role: 'user', content: prompt }
        ];
      }

      // Configure request options
      const requestOptions: any = {
        messages,
        model: modelToUse,
      };

      console.log('Sending request with options:', JSON.stringify(requestOptions, null, 2));
      const response = await client.chat.completions.create(requestOptions);
      console.log('Response received successfully');


      return response || 'No response generated';
    } catch (error) {
      console.error('AI generation error:', error);
      console.log('Current model:', modelToUse);

      // Provide more detailed error information
      if (error instanceof Error) {
        if (provider === MODEL_PROVIDERS.DEEPSEEK) {
          throw new Error(`Failed to generate response with DeepSeek model ${modelToUse}. Error: ${error.message}. Please check your DeepSeek API key and try again.`);
        } else if (provider === MODEL_PROVIDERS.PERPLEXITY) {
          throw new Error(`Failed to generate response with Perplexity model ${modelToUse}. Error: ${error.message}. Please check your Perplexity API key and try again.`);
        } else {
          throw new Error(`Failed to generate response with ${modelToUse}. Error: ${error.message}`);
        }
      } else {
        throw new Error(`Failed to generate AI response with ${modelToUse}`);
      }
    }
  };

  return {
    generateResponse,
    isLoading,
    error,
    isInitialized: !!(openaiClient || deepseekClient || perplexityClient),
    currentModel,
    setCurrentModel
  };
}