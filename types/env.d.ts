declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_AI_API_KEY: string;
      EXPO_PUBLIC_OLLAMA_URL?: string;
      EXPO_PUBLIC_DEEPSEEK_KEY?: string;
      EXPO_PUBLIC_LMSTUDIO_URL?: string;
      EXPO_PUBLIC_PERPLEXITY_KEY?: string;
    }
  }
}

export {};