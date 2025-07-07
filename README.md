# Gemini AI Model Testing Interface

A React-based web application for testing and comparing Google's Gemini AI models side-by-side. This tool allows you to send the same prompt to multiple Gemini models simultaneously and compare their responses, performance, and capabilities.

## Features

- **Side-by-Side Comparison**: Test up to 3 different Gemini models simultaneously
- **Comprehensive Model Support**: Supports all major Gemini model generations (1.0, 1.5, 2.0, 2.5)
- **Performance Metrics**: Track response times and timestamps for each model
- **Real-time Results**: See responses as they come in with loading states
- **Error Handling**: Graceful error handling with detailed error messages
- **Modern UI**: Clean, responsive interface built with React and TypeScript

## Supported Models

### Gemini 2.5 Series (Latest - 2025)
- **Gemini 2.5 Pro** - Most intelligent thinking model with enhanced reasoning
- **Gemini 2.5 Flash** - Best price-performance with adaptive thinking
- **Gemini 2.5 Flash Lite** - Most cost-efficient for high throughput
- **Gemini 2.5 Flash/Pro TTS** - Text-to-speech variants

### Gemini 2.0 Series (Current - 2024/2025)
- **Gemini 2.0 Flash** - Next-gen features with native tool use
- **Gemini 2.0 Flash Thinking** - Experimental model with visible reasoning
- **Gemini 2.0 Flash Lite** - Cost-efficient low-latency version
- **Gemini 2.0 Pro** - Advanced capabilities with enhanced performance

### Gemini 1.5 Series (Stable - 2024)
- **Gemini 1.5 Pro** - Complex reasoning with 2M token context
- **Gemini 1.5 Flash** - Fast and versatile performance
- **Gemini 1.5 Flash 8B** - Smaller model for high volume tasks

### Live API Models
- **Gemini 2.5/2.0 Flash Live** - Real-time audio/video processing

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- Google AI Studio API key

## Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd gemini-testing-react
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**

Create a `.env` file in the root directory:
```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
```

4. **Get your Gemini API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the API key and add it to your `.env` file

## Usage

1. **Start the development server:**
```bash
npm run dev
```

2. **Open your browser:**
Navigate to `http://localhost:5173` (or the URL shown in your terminal)

3. **Select Models:**
   - Choose different Gemini models for each of the 3 columns
   - Models are categorized by generation and capability

4. **Enter Your Prompt:**
   - Type your question or prompt in the input field
   - Click "Send to All Models" or press Enter

5. **Compare Results:**
   - View responses from all selected models side-by-side
   - See response times and timestamps
   - Compare quality, speed, and capabilities

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
src/
├── components/          # React components
│   ├── Column.tsx      # Individual model column
│   ├── ModelSelector.tsx
│   ├── PromptInput.tsx
│   └── ResponseDisplay.tsx
├── config/
│   └── geminiModels.ts # Model configurations
├── services/
│   └── GeminiService.ts # API service layer
├── types/
│   └── gemini.ts       # TypeScript type definitions
└── App.tsx             # Main application component
```

## Security Notes

- Never commit your `.env` file to version control
- Keep your API key secure and don't share it publicly
- The `.env` file is already added to `.gitignore`
- Consider using environment-specific API keys for development vs production

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and development server
- **ESLint** - Code linting
- **Google Gemini API** - AI model access

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues with the application, please create an issue in the repository.
For Gemini API-related questions, refer to the [Google AI Studio documentation](https://ai.google.dev/).
