import { useState, useCallback, memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Wand2, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

// Constants
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Custom components for markdown styling
const MarkdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 pb-2 border-b border-white/10">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl md:text-2xl font-semibold text-blue-300 mb-6 mt-8 first:mt-0">
      {children}
    </h2>
  ),
  p: ({ children }) => (
    <p className="text-gray-300 leading-relaxed mb-4">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="space-y-3 mb-6">
      {children}
    </ul>
  ),
  li: ({ children }) => (
    <li className="bg-white/5 rounded-lg p-3 border border-white/5 hover:bg-white/10 transition-colors duration-200">
      {children}
    </li>
  ),
  code: ({ children }) => (
    <code className="bg-gray-800 px-2 py-1 rounded text-sm font-mono text-blue-300">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto border border-white/10 mb-4">
      {children}
    </pre>
  ),
};

// Custom typing animation hook
const useTypingAnimation = (text: string, speed: number = 20) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    setDisplayedText('');

    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(prev => prev + text[index]);
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayedText, isTyping };
};

// Custom hook for enhancement logic
const useEnhanceIdea = () => {
  const [state, setState] = useState({
    input: '',
    output: '',
    loading: false,
    copied: false,
  });

  const { displayedText, isTyping } = useTypingAnimation(state.output, 20);

  const enhanceIdea = useCallback(async () => {
    if (!state.input.trim()) return;

    setState(prev => ({ ...prev, loading: true, output: '' }));

    try {
      const response = await fetch(`${API_BASE_URL}/enhance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ input: state.input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setState(prev => ({ ...prev, output: data.enhanced, loading: false }));
    } catch (error) {
      console.error('Error enhancing idea:', error);
      setState(prev => ({
        ...prev,
        output: 'Error: Could not enhance the idea. Please try again.',
        loading: false
      }));
    }
  }, [state.input]);

  const copyToClipboard = useCallback(() => {
    if (state.output) {
      navigator.clipboard.writeText(state.output);
      setState(prev => ({ ...prev, copied: true }));
      setTimeout(() => setState(prev => ({ ...prev, copied: false })), 2000);
    }
  }, [state.output]);

  const setInput = useCallback((value: string) => {
    setState(prev => ({ ...prev, input: value }));
  }, []);

  return {
    ...state,
    displayedText,
    isTyping,
    enhanceIdea,
    copyToClipboard,
    setInput,
  };
};

const Hero = memo(() => {
  const { input, output, loading, copied, displayedText, isTyping, enhanceIdea, copyToClipboard, setInput } = useEnhanceIdea();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl"
      >
        <Card className="backdrop-blur-xl bg-black/40 border-white/10">
          <CardContent className="p-8 space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent text-center"
            >
              Vibe Coder
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg text-center text-gray-300"
            >
              Transform your rough website idea into a polished prompt.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Textarea
                placeholder="I want a website for..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[100px] bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                maxLength={1000}
              />
            </motion.div>

            {/* Recommended Test Ideas */}
            {!output && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="text-center"
              >
                <p className="text-sm text-gray-400 mb-3">Try these ideas:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "A portfolio website for a photographer",
                    "An e-commerce site for handmade crafts",
                    "A blog about sustainable living",
                    "A restaurant website with online ordering",
                    "A fitness app landing page"
                  ].map((idea, index) => (
                    <motion.button
                      key={idea}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setInput(idea)}
                      className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full text-gray-300 hover:text-white transition-all duration-200"
                    >
                      {idea}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex justify-center"
            >
              <Button
                onClick={enhanceIdea}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Magic
              </Button>
            </motion.div>
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </motion.div>
              )}
              {output && !loading && (
                <motion.div
                  key="output"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <Card className="backdrop-blur-md bg-black/50 border-white/10">
                    <CardContent className="p-6">
                      <ReactMarkdown components={MarkdownComponents}>
                        {displayedText}
                      </ReactMarkdown>
                      {isTyping && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="inline-block w-2 h-5 bg-blue-400 ml-1"
                        />
                      )}
                    </CardContent>
                  </Card>
                  <div className="relative">
                    <Button
                      onClick={copyToClipboard}
                      size="sm"
                      className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 text-white hover:text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/20"
                      disabled={!output}
                    >
                      <Copy className="h-4 w-4" />
                      {copied && (
                        <span className="ml-1 text-xs font-medium">
                          Copied!
                        </span>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
});

Hero.displayName = 'Hero';

export default Hero;