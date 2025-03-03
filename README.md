# AI Service App

A modern React Native application that provides an intuitive interface for interacting with various AI models through speech and text. The app supports multiple AI providers and features real-time speech recognition, text-to-speech capabilities, and thread-based conversation management.

## Features

- 🎙️ **Speech Recognition**: Real-time voice input with support for multiple languages
- 💬 **Text Chat**: Traditional text-based interaction with AI models
- 🤖 **Multiple AI Models**: Support for various AI providers including OpenAI and Perplexity
- 🔄 **Thread Management**: Organize conversations in separate threads
- 🗣️ **Text-to-Speech**: AI responses can be read aloud
- 📱 **Modern UI**: Beautiful and responsive interface with dark mode support
- 🔒 **Secure**: API keys are stored securely
- 🌍 **Multi-language Support**: Configurable speech recognition language

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- React Native development environment
- iOS Simulator/Device (for iOS development)
- Android Studio/Device (for Android development)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-service-app.git
cd ai-service-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Install iOS dependencies (iOS only):
```bash
cd ios
pod install
cd ..
```

4. Create a `.env` file in the root directory and add your API keys:
```
OPENAI_API_KEY=your_openai_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
```

## Running the App

### iOS
```bash
npm run ios
# or
yarn ios
```

### Android
```bash
npm run android
# or
yarn android
```

## Configuration

### AI Models
The app supports multiple AI models. You can configure them in `src/services/storage.ts`:

- OpenAI models (e.g., GPT-3.5-turbo, GPT-4)
- Perplexity models
- Add other providers as needed

### Speech Recognition
Speech recognition settings can be configured in the app settings:

- Recognition language
- Voice options
- Speech rate and pitch

## Usage

1. **Starting a Conversation**
   - Tap "New Chat" to start a new conversation
   - Use the microphone button for voice input
   - Type in the text input for written messages

2. **Managing Threads**
   - View all conversations in the "All Threads" section
   - Threads are automatically titled based on the first message
   - Switch between threads easily

3. **Changing AI Models**
   - Tap "Change" next to the current model name
   - Select from available models in the model picker
   - Models require appropriate API keys

4. **Voice Settings**
   - Configure speech recognition language
   - Adjust text-to-speech settings
   - Enable/disable voice feedback

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with React Native and Expo
- Uses various AI providers' APIs
- Implements Expo Speech Recognition
- Uses React Native Gifted Chat for the chat interface
