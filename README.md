# Prompt to Animation

A React application that uses Google's Gemini AI to generate dynamic animations based on text prompts. The application creates smooth, performant animations using JavaScript and HTML5 Canvas.

## Features

- Text-to-animation conversion using Gemini AI
- Real-time animation generation
- Smooth, performant animations using requestAnimationFrame
- Responsive design
- Clean animation cleanup and memory management

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API key

## Setup

1. Clone the repository:
```bash
git clone https://github.com/ManDroid-31/prompt-to-animation.git
cd prompt-to-animation
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory:
```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Environment Variables

Create a `.env` file in the root directory with the following variable:

- `VITE_GEMINI_API_KEY`: Your Google Gemini API key

## Usage

1. Enter a text prompt describing the animation you want to create
2. Click "Generate Animation" to start the generation process
3. Watch the animation appear in real-time
4. The code preview will show the generated JavaScript code

## Example Prompts

- "Create a box that moves from left to right"
- "Show a database splitting into SQL and NoSQL"
- "Animate a bouncing ball with gravity"
- "Create a particle system explosion"

## Development

The project is built with:
- React
- Vite
- Google Gemini AI API
- Modern JavaScript (ES6+)

## Security

- API keys are stored in environment variables
- `.env` file is gitignored to prevent accidental commits
- All animations are sandboxed and cleaned up properly

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini AI for the animation generation capabilities
- React and Vite for the development framework
- The open-source community for various tools and libraries
