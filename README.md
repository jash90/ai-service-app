# AI Chat Assistant

A React Native mobile application that enables natural conversations with AI through text and voice input. Built with OpenAI's GPT models, the app provides a seamless chat experience with thread management and voice recognition capabilities.

## Features

- 💬 **Smart Chat**: Intelligent conversations powered by OpenAI's GPT models
- 🎙️ **Voice Input**: Seamless voice-to-text for natural interaction
- 📝 **Text Chat**: Traditional text-based messaging interface
- 🧵 **Thread Management**: Organize and manage multiple conversations
- 🤖 **Model Selection**: Choose between GPT-3.5 and GPT-4 models
- 📱 **Modern UI**: Clean and responsive interface using GiftedChat

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- React Native development environment
- OpenAI API key

### Installation

1. Clone and install dependencies:
```bash
git clone https://github.com/yourusername/ai-chat-assistant.git
cd ai-chat-assistant
npm install
```

2. Set up environment variables:
```bash
# Create .env file
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
# iOS
npm run ios

# Android
npm run android
```

## Usage Guide

### Chat Interface

- Start a new chat using the "+" button
- Type messages in the text input
- Use the microphone button for voice input
- View message history in threaded conversations

### Model Selection

- Choose your preferred GPT model
- Available models:
  - GPT-3.5 Turbo (default)
  - GPT-4
  - GPT-4 Turbo

### Thread Management

- View all conversations in the Threads tab
- Switch between active conversations
- Delete unwanted threads
- Threads are automatically titled based on context

## Project Structure

```
src/
├── components/          # React components
│   ├── chat/           # Chat interface components
│   ├── voice/          # Voice input components
│   └── common/         # Shared components
├── hooks/              # Custom React hooks
├── services/           # Core services
│   ├── ai.ts          # OpenAI integration
│   └── storage.ts     # Local storage management
└── types/             # TypeScript definitions
```

## Key Technologies

- React Native & Expo
- OpenAI GPT API
- React Native GiftedChat
- Expo Speech Recognition
- AsyncStorage for persistence

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
# iOS
npm run build:ios

# Android
npm run build:android
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
