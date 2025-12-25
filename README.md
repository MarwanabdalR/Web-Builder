# Vibe Coder 🚀

An AI-powered website idea enhancer that transforms rough website concepts into polished, actionable prompts using Google's Gemini AI.

## ✨ Features

- **AI-Powered Enhancement**: Uses Google Gemini AI to transform basic website ideas into detailed, professional prompts
- **Beautiful Dark SaaS UI**: Modern glassmorphism design with animated backgrounds
- **Real-time Typing Animation**: Watch your enhanced prompts appear with smooth typing effects
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Markdown Rendering**: Rich formatting for enhanced readability
- **Copy to Clipboard**: One-click copying of generated prompts

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Markdown** for content rendering
- **Shadcn/ui** for UI components

### Backend
- **Node.js** with Express
- **Google Gemini AI** for prompt enhancement
- **Zod** for validation
- **Winston** for logging
- **Express Rate Limit** for API protection

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MarwanabdalR/Web-Builder
   cd Web-Builder
   ```

2. **Install dependencies**
   ```bash
   # Install client dependencies
   cd clientWebApp
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the `server` directory:
   ```env
   PORT=3001
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development servers**

   In one terminal (for the backend):
   ```bash
   cd server
   npm start
   ```

   In another terminal (for the frontend):
   ```bash
   cd clientWebApp
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:5173` to see the application!

## 📝 Usage

1. Enter a rough website idea in the text area (e.g., "A portfolio website for a photographer")
2. Click the "Magic" button
3. Watch as AI transforms your idea into a detailed, professional prompt
4. Copy the enhanced prompt to use in your development workflow

## 🎨 Demo Ideas

Try these sample prompts:
- "A portfolio website for a photographer"
- "An e-commerce site for handmade crafts"
- "A blog about sustainable living"
- "A restaurant website with online ordering"
- "A fitness app landing page"

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Google Gemini AI for powering the prompt enhancement
- The React and TypeScript communities
- All the amazing open-source libraries used in this project

---

Built with ❤️ by [Marwan Abdalrady]