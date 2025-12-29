require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const { z } = require('zod');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Constants
const PORT = process.env.PORT || 3001;
const GEMINI_MODEL = 'gemini-2.5-flash'; 
const REQUEST_TIMEOUT = 60000; 

// Validation schema
const enhanceRequestSchema = z.object({
  input: z.string().min(1).max(1000).trim(),
});

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Environment validation
if (!process.env.GEMINI_API_KEY) {
  logger.error('GEMINI_API_KEY environment variable is required');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

const window = new JSDOM('').window;
const DOMPurifyInstance = DOMPurify(window);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port for development (both http and https)
    if (
      origin.startsWith('http://localhost:') || 
      origin.startsWith('https://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.startsWith('https://127.0.0.1:')
    ) {
      return callback(null, true);
    }
    
    // Allow Vercel deployments (both http and https)
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    // Allow Render.com deployments
    if (origin.includes('.onrender.com')) {
      return callback(null, true);
    }
    
    logger.warn('Blocked by CORS:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(limiter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', model: GEMINI_MODEL, timestamp: new Date().toISOString() });
});

app.post('/enhance', async (req, res) => {
  try {
    const { input } = enhanceRequestSchema.parse(req.body);
    const sanitizedInput = DOMPurifyInstance.sanitize(input);

    logger.info(`Processing Request for: "${sanitizedInput}"`);

    const masterPrompt = `
      Act as an elite Product Development Team.
      Analyze the following web app idea: "${sanitizedInput}".
      Output the result in Markdown format exactly as requested previously.
      ... (Keep prompts concise to save tokens) ...
      
      # ⚡ Vibe Coder Blueprint
      ## 💡 Strategy & Concept
      * **Project Name:** [Name]
      * **Value Proposition:** [Value]
      * **Core Features:** [Features]
      ## 🛠 Tech Architecture
      * **Frontend:** [Stack]
      * **Backend:** [Stack]
      ## 🎨 UI/UX Direction
      * **Vibe:** [Vibe]
      * **Color Palette:** [Colors]
      * **Typography:** [Fonts]
    `;

    const generatePromise = model.generateContent(masterPrompt);
    
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT);
    });

    let result;
    try {
      result = await Promise.race([generatePromise, timeoutPromise]);
      clearTimeout(timeoutId);
    } catch (raceError) {
      clearTimeout(timeoutId);
      if (raceError.message === 'Request timeout') {
        return res.status(408).json({ enhanced: "⚠️ Request timed out." });
      }
      throw raceError;
    }

    const finalOutput = result.response.text();
    res.json({ enhanced: finalOutput });

  } catch (error) {
    logger.error('Enhancement error:', {
      message: error.message,
      stack: error.stack,
      status: error.status,
      code: error.code,
      name: error.name
    });

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    if (error.message === 'Request timeout') {
      return res.status(408).json({ enhanced: "⚠️ Request timed out." });
    }

    // Handle API key errors (403 Forbidden - leaked/invalid key)
    if (error.status === 403 || error.message?.includes('API key') || error.message?.includes('leaked') || error.message?.includes('403')) {
      logger.error('API Key Error:', error.message);
      return res.status(500).json({ 
        enhanced: `# ⚠️ API Key Error\n\nYour Gemini API key has been disabled or is invalid. Please:\n1. Generate a new API key from [Google AI Studio](https://aistudio.google.com/app/apikey)\n2. Update the \`GEMINI_API_KEY\` environment variable on Render\n3. Redeploy your service\n\n**Error:** ${error.message || 'API key invalid or leaked'}` 
      });
    }

    // Handle rate limiting (429 Too Many Requests)
    if (error.status === 429 || error.message?.includes('429')) {
      return res.json({ 
        enhanced: `# ⚠️ Quota Exceeded\n\n**Gemini API** is currently busy. Please try again in 1 minute.\n\n*(This is a fallback response)*` 
      });
    }

    // Handle invalid model name or other API errors (400 Bad Request)
    if (error.status === 400 || error.message?.includes('model') || error.message?.includes('invalid')) {
      logger.error('API Configuration Error:', error.message);
      return res.status(500).json({ 
        enhanced: `# ⚠️ Configuration Error\n\nThere's an issue with the API configuration. Please check:\n- Model name is valid\n- API key is correct\n\n**Error:** ${error.message || 'Invalid configuration'}` 
      });
    }

    logger.error('Unexpected error details:', error);
    res.status(500).json({ 
      enhanced: `# ⚠️ Error Connecting to AI\n\n**Error:** ${error.message || 'Unknown error'}\n\nPlease check server logs for more details.` 
    });
  }
});

app.listen(PORT, () => {
  logger.info(`✅ Server running on http://localhost:${PORT}`);
});