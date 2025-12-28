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
    
    // Allow localhost on any port for development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    
    // Allow Vercel deployments
    if (origin.endsWith('.vercel.app')) {
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

const timeout = (ms) => new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Request timeout')), ms)
);

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

    const result = await Promise.race([
      model.generateContent(masterPrompt),
      timeout(REQUEST_TIMEOUT)
    ]);

    const finalOutput = result.response.text();
    res.json({ enhanced: finalOutput });

  } catch (error) {
    logger.error('Enhancement error:', error);

    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input' });
    if (error.message === 'Request timeout') return res.status(408).json({ enhanced: "⚠️ Request timed out." });

    // Fallback for Quota (Since you kept 2.5-flash)
    if (error.status === 429 || error.message?.includes('429')) {
      return res.json({ 
        enhanced: `# ⚠️ Quota Exceeded\n\n**Gemini 2.5 Flash** is currently busy. Please try again in 1 minute.\n\n*(This is a fallback response)*` 
      });
    }

    res.status(500).json({ enhanced: "⚠️ Error connecting to AI." });
  }
});

app.listen(PORT, () => {
  logger.info(`✅ Server running on http://localhost:${PORT}`);
});