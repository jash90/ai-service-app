import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
    OPENAI_API_KEY: 'openai_api_key',
    DEEPSEEK_API_KEY: 'deepseek_api_key',
    PERPLEXITY_API_KEY: 'perplexity_api_key',
    SETTINGS: 'app_settings',
    AI_MODEL: 'ai_model',
    LANGUAGE: 'speech_language',
    CHAT_THREADS: 'chat_threads',
    CURRENT_THREAD_ID: 'current_thread_id',
};

// Available AI models
export const AI_MODELS = {
    GPT_3_5_TURBO: 'gpt-3.5-turbo',
    GPT_3_5_TURBO_16K: 'gpt-3.5-turbo-16k',
    GPT_4: 'gpt-4',
    GPT_4_TURBO: 'gpt-4-turbo-preview',
    GPT_4_32K: 'gpt-4-32k',
    GPT_4_VISION: 'gpt-4-vision-preview',
    GPT_4O: 'gpt-4o',
    GPT_4O_MINI: 'gpt-4o-mini',
    GPT_4_5_PREVIEW: 'gpt-4.5-preview',
    O1: 'o1',
    O3_MINI: 'o3-mini',
    DEEPSEEK_CHAT: 'deepseek-chat',
    DEEPSEEK_REASONER: 'deepseek-reasoner',
    PERPLEXITY_SONAR_DEEP_RESEARCH: 'sonar-deep-research',
    PERPLEXITY_SONAR_REASONING_PRO: 'sonar-reasoning-pro',
    PERPLEXITY_SONAR_REASONING: 'sonar-reasoning',
    PERPLEXITY_SONAR_PRO: 'sonar-pro',
    PERPLEXITY_SONAR: 'sonar',
    PERPLEXITY_R1_1776: 'r1-1776',
} as const;

// Model providers
export const MODEL_PROVIDERS = {
    OPENAI: 'openai',
    DEEPSEEK: 'deepseek',
    PERPLEXITY: 'perplexity',
} as const;

export type ModelProvider = typeof MODEL_PROVIDERS[keyof typeof MODEL_PROVIDERS];

export type AIModel = typeof AI_MODELS[keyof typeof AI_MODELS];

// Map models to their providers
export const MODEL_TO_PROVIDER: Record<AIModel, ModelProvider> = {
    [AI_MODELS.GPT_3_5_TURBO]: MODEL_PROVIDERS.OPENAI,
    [AI_MODELS.GPT_3_5_TURBO_16K]: MODEL_PROVIDERS.OPENAI,
    [AI_MODELS.GPT_4]: MODEL_PROVIDERS.OPENAI,
    [AI_MODELS.GPT_4_TURBO]: MODEL_PROVIDERS.OPENAI,
    [AI_MODELS.GPT_4_32K]: MODEL_PROVIDERS.OPENAI,
    [AI_MODELS.GPT_4_VISION]: MODEL_PROVIDERS.OPENAI,
    [AI_MODELS.GPT_4O]: MODEL_PROVIDERS.OPENAI,
    [AI_MODELS.GPT_4O_MINI]: MODEL_PROVIDERS.OPENAI,
    [AI_MODELS.GPT_4_5_PREVIEW]: MODEL_PROVIDERS.OPENAI,
    [AI_MODELS.O1]: MODEL_PROVIDERS.OPENAI,
    [AI_MODELS.O3_MINI]: MODEL_PROVIDERS.OPENAI,
    [AI_MODELS.DEEPSEEK_CHAT]: MODEL_PROVIDERS.DEEPSEEK,
    [AI_MODELS.DEEPSEEK_REASONER]: MODEL_PROVIDERS.DEEPSEEK,
    [AI_MODELS.PERPLEXITY_SONAR_DEEP_RESEARCH]: MODEL_PROVIDERS.PERPLEXITY,
    [AI_MODELS.PERPLEXITY_SONAR_REASONING_PRO]: MODEL_PROVIDERS.PERPLEXITY,
    [AI_MODELS.PERPLEXITY_SONAR_REASONING]: MODEL_PROVIDERS.PERPLEXITY,
    [AI_MODELS.PERPLEXITY_SONAR_PRO]: MODEL_PROVIDERS.PERPLEXITY,
    [AI_MODELS.PERPLEXITY_SONAR]: MODEL_PROVIDERS.PERPLEXITY,
    [AI_MODELS.PERPLEXITY_R1_1776]: MODEL_PROVIDERS.PERPLEXITY,
};

// Available languages
export const LANGUAGES = {
    ENGLISH_US: 'en-US',
    ENGLISH_UK: 'en-GB',
    POLISH: 'pl-PL',
    SPANISH: 'es-ES',
    FRENCH: 'fr-FR',
    GERMAN: 'de-DE',
    ITALIAN: 'it-IT',
    PORTUGUESE: 'pt-PT',
    RUSSIAN: 'ru-RU',
    JAPANESE: 'ja-JP',
    KOREAN: 'ko-KR',
    CHINESE: 'zh-CN',
} as const;

export type Language = typeof LANGUAGES[keyof typeof LANGUAGES];

// Default settings
export const DEFAULT_SETTINGS = {
    autoGenerateResponse: true,
    useHighQualityVoice: true,
    saveTranscriptions: false,
};

// Default AI model
export const DEFAULT_AI_MODEL: AIModel = AI_MODELS.GPT_3_5_TURBO;

// Default language
export const DEFAULT_LANGUAGE: Language = LANGUAGES.ENGLISH_US;

// Type for app settings
export type AppSettings = typeof DEFAULT_SETTINGS;

/**
 * Save OpenAI API key to AsyncStorage
 */
export const saveApiKey = async (apiKey: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.OPENAI_API_KEY, apiKey);
    } catch (error) {
        console.error('Error saving API key:', error);
        throw new Error('Failed to save API key');
    }
};

/**
 * Get OpenAI API key from AsyncStorage
 */
export const getApiKey = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(STORAGE_KEYS.OPENAI_API_KEY);
    } catch (error) {
        console.error('Error getting API key:', error);
        return null;
    }
};

/**
 * Save DeepSeek API key to AsyncStorage
 */
export const saveDeepSeekApiKey = async (apiKey: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.DEEPSEEK_API_KEY, apiKey);
    } catch (error) {
        console.error('Error saving DeepSeek API key:', error);
        throw new Error('Failed to save DeepSeek API key');
    }
};

/**
 * Get DeepSeek API key from AsyncStorage
 */
export const getDeepSeekApiKey = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(STORAGE_KEYS.DEEPSEEK_API_KEY);
    } catch (error) {
        console.error('Error getting DeepSeek API key:', error);
        return null;
    }
};

/**
 * Save Perplexity API key to AsyncStorage
 */
export const savePerplexityApiKey = async (apiKey: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.PERPLEXITY_API_KEY, apiKey);
    } catch (error) {
        console.error('Error saving Perplexity API key:', error);
        throw error;
    }
};

/**
 * Get Perplexity API key from AsyncStorage
 */
export const getPerplexityApiKey = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(STORAGE_KEYS.PERPLEXITY_API_KEY);
    } catch (error) {
        console.error('Error getting Perplexity API key:', error);
        throw error;
    }
};

/**
 * Get API key for the specified model
 */
export const getApiKeyForModel = async (model: AIModel): Promise<string | null> => {
    const provider = MODEL_TO_PROVIDER[model];
    console.log(`Getting API key for model: ${model}, provider: ${provider}`);

    if (provider === MODEL_PROVIDERS.OPENAI) {
        const key = await getApiKey();
        console.log('OpenAI API key exists:', !!key);
        return key;
    } else if (provider === MODEL_PROVIDERS.DEEPSEEK) {
        const key = await getDeepSeekApiKey();
        console.log('DeepSeek API key exists:', !!key);
        return key;
    } else if (provider === MODEL_PROVIDERS.PERPLEXITY) {
        const key = await getPerplexityApiKey();
        console.log('Perplexity API key exists:', !!key);
        return key;
    }
    console.warn('No provider found for model:', model);
    return null;
};

/**
 * Save AI model to AsyncStorage
 */
export const saveAIModel = async (model: AIModel): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.AI_MODEL, model);
    } catch (error) {
        console.error('Error saving AI model:', error);
        throw new Error('Failed to save AI model');
    }
};

/**
 * Get AI model from AsyncStorage
 */
export const getAIModel = async (): Promise<AIModel> => {
    try {
        const model = await AsyncStorage.getItem(STORAGE_KEYS.AI_MODEL);
        if (model && Object.values(AI_MODELS).includes(model as AIModel)) {
            return model as AIModel;
        }
        return DEFAULT_AI_MODEL;
    } catch (error) {
        console.error('Error getting AI model:', error);
        return DEFAULT_AI_MODEL;
    }
};

/**
 * Save language to AsyncStorage
 */
export const saveLanguage = async (language: Language): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    } catch (error) {
        console.error('Error saving language:', error);
        throw new Error('Failed to save language');
    }
};

/**
 * Get language from AsyncStorage
 */
export const getLanguage = async (): Promise<Language> => {
    try {
        const language = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
        if (language && Object.values(LANGUAGES).includes(language as Language)) {
            return language as Language;
        }
        return DEFAULT_LANGUAGE;
    } catch (error) {
        console.error('Error getting language:', error);
        return DEFAULT_LANGUAGE;
    }
};

/**
 * Save app settings to AsyncStorage
 */
export const saveSettings = async (settings: AppSettings): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving settings:', error);
        throw new Error('Failed to save settings');
    }
};

/**
 * Get app settings from AsyncStorage
 */
export const getSettings = async (): Promise<AppSettings> => {
    try {
        const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (settingsJson) {
            return JSON.parse(settingsJson);
        }
        return DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Error getting settings:', error);
        return DEFAULT_SETTINGS;
    }
};

// Chat thread interface
export interface ChatThread {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
    messages: any[]; // Using any for compatibility with GiftedChat messages
}

/**
 * Save a chat thread
 */
export const saveChatThread = async (thread: ChatThread): Promise<void> => {
    try {
        // Get existing threads
        const threads = await getChatThreads();

        // Find if thread already exists
        const threadIndex = threads.findIndex(t => t.id === thread.id);

        if (threadIndex >= 0) {
            // Update existing thread
            threads[threadIndex] = thread;
        } else {
            // Add new thread
            threads.push(thread);
        }

        // Save updated threads
        await AsyncStorage.setItem(STORAGE_KEYS.CHAT_THREADS, JSON.stringify(threads));
    } catch (error) {
        console.error('Error saving chat thread:', error);
        throw error;
    }
};

/**
 * Get all chat threads
 */
export const getChatThreads = async (): Promise<ChatThread[]> => {
    try {
        const threadsJson = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_THREADS);
        return threadsJson ? JSON.parse(threadsJson) : [];
    } catch (error) {
        console.error('Error getting chat threads:', error);
        throw error;
    }
};

/**
 * Get a specific chat thread by ID
 */
export const getChatThreadById = async (threadId: string): Promise<ChatThread | null> => {
    try {
        const threads = await getChatThreads();
        return threads.find(thread => thread.id === threadId) || null;
    } catch (error) {
        console.error('Error getting chat thread by ID:', error);
        throw error;
    }
};

/**
 * Delete a chat thread
 */
export const deleteChatThread = async (threadId: string): Promise<void> => {
    try {
        const threads = await getChatThreads();
        const updatedThreads = threads.filter(thread => thread.id !== threadId);
        await AsyncStorage.setItem(STORAGE_KEYS.CHAT_THREADS, JSON.stringify(updatedThreads));
    } catch (error) {
        console.error('Error deleting chat thread:', error);
        throw error;
    }
};

/**
 * Save current thread ID
 */
export const saveCurrentThreadId = async (threadId: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_THREAD_ID, threadId);
    } catch (error) {
        console.error('Error saving current thread ID:', error);
        throw error;
    }
};

/**
 * Get current thread ID
 */
export const getCurrentThreadId = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_THREAD_ID);
    } catch (error) {
        console.error('Error getting current thread ID:', error);
        throw error;
    }
}; 