# Vibe Coder - Hero Section

A stunning hero section for transforming rough website ideas into polished prompts.

## Features

- **Interactive UI**: Clean, glassmorphism design with dark mode
- **Smooth Animations**: Framer Motion for entry and interaction animations
- **Prompt Enhancement**: Backend API that improves user ideas into professional prompts
- **Responsive Design**: Mobile-friendly layout
- **Copy to Clipboard**: Easy sharing of enhanced prompts

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion, Shadcn UI
- **Backend**: Node.js, Express
- **Font**: Inter (Google Fonts)

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory.

2. **Install frontend dependencies**:
   ```bash
   cd clientWebApp
   npm install
   ```

3. **Install backend dependencies**:
   ```bash
   cd ../server
   npm install
   ```

### Running the Application

1. **Start the backend server**:
   ```bash
   cd server
   npm start
   ```
   The server will run on http://localhost:3001

2. **Start the frontend**:
   ```bash
   cd clientWebApp
   npm run dev
   ```
   The app will be available at http://localhost:5173

### Building for Production

```bash
cd clientWebApp
npm run build
```

## Usage

1. Enter your rough website idea in the textarea
2. Click the "Magic" button
3. Wait for the enhancement (simulated loading)
4. View the improved prompt
5. Copy it to clipboard if needed

## API Endpoints

- `POST /enhance`: Accepts `{ input: string }` and returns `{ enhanced: string }`
- `GET /health`: Health check endpoint

## Security Features

- **Input Validation**: Zod schema validation with length limits
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Sanitization**: DOMPurify for XSS prevention
- **CORS**: Restricted to allowed origins
- **Timeout Protection**: 30-second timeout on AI requests
- **Error Handling**: Structured error responses without information leakage

## Project Structure

```
Web-Builder/
├── clientWebApp/     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Background.tsx
│   │   │   ├── Hero.tsx
│   │   │   └── ui/          # Shadcn components
│   │   └── ...
│   └── ...
└── server/           # Express backend
    ├── server.js
    └── package.json
```

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
