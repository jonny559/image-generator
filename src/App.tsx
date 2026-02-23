/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Download, 
  Image as ImageIcon, 
  Loader2, 
  ArrowRight, 
  Layers, 
  Maximize2,
  Zap,
  Github,
  Twitter
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { cn } from './lib/utils';

// Types
type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
type Style = 'Realistic' | 'Anime' | '3D' | 'Cyberpunk' | 'Oil Painting' | 'Sketch';

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<Style>('Realistic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first.');
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading('Igniting the creative spark...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const fullPrompt = `${prompt}${style !== 'Realistic' ? `, in ${style} style` : ''}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
          },
        },
      });

      let imageUrl = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        const newImage: GeneratedImage = {
          url: imageUrl,
          prompt: prompt,
          timestamp: Date.now(),
        };
        setGeneratedImage(newImage);
        setHistory(prev => [newImage, ...prev].slice(0, 10));
        toast.success('Masterpiece created!', { id: loadingToast });
      } else {
        throw new Error('No image was generated. Please try a different prompt.');
      }
    } catch (error: any) {
      console.error('Generation Error:', error);
      toast.error(error.message || 'Failed to generate image. Please try again.', { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started!');
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-brand-purple/30">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#030712]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center shadow-lg shadow-brand-purple/20">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white hidden sm:block">
              Luminary<span className="text-brand-purple">AI</span>
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Showcase</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">API</a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Log in
            </button>
            <button className="px-5 py-2 rounded-full text-sm font-semibold text-white btn-gradient">
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-xs font-bold uppercase tracking-wider mb-6">
              <Zap className="w-3 h-3" />
              Powered by Gemini 2.5
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              Transform your <span className="text-gradient">imagination</span> into art
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              Experience the next generation of AI image generation. High-fidelity, 
              stylized, and stunning visuals in seconds.
            </p>
          </motion.div>
        </section>

        {/* Generator Interface */}
        <section className="max-w-4xl mx-auto">
          <motion.div 
            className="glass rounded-3xl p-6 md:p-8 mb-12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex flex-col gap-6">
              {/* Prompt Input */}
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A futuristic city with floating neon gardens and crystalline skyscrapers..."
                  className="w-full h-32 bg-black/20 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all resize-none"
                />
                <div className="absolute bottom-4 right-4 text-xs text-slate-500">
                  {prompt.length}/500
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Layers className="w-3 h-3" /> Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value as Style)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Realistic">Realistic</option>
                    <option value="Anime">Anime</option>
                    <option value="3D">3D Render</option>
                    <option value="Cyberpunk">Cyberpunk</option>
                    <option value="Oil Painting">Oil Painting</option>
                    <option value="Sketch">Sketch</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Maximize2 className="w-3 h-3" /> Aspect Ratio
                  </label>
                  <div className="flex gap-2">
                    {(['1:1', '4:3', '16:9', '3:4', '9:16'] as AspectRatio[]).map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-xs font-bold transition-all border",
                          aspectRatio === ratio 
                            ? "bg-brand-purple/20 border-brand-purple text-white" 
                            : "bg-black/20 border-white/10 text-slate-500 hover:border-white/20"
                        )}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateImage}
                disabled={isGenerating}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all group",
                  isGenerating ? "bg-slate-800 cursor-not-allowed" : "btn-gradient"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating your vision...
                  </>
                ) : (
                  <>
                    Generate Image
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Result Section */}
          <AnimatePresence mode="wait">
            {generatedImage ? (
              <motion.div
                key={generatedImage.timestamp}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="glass rounded-3xl overflow-hidden"
              >
                <div className="relative aspect-auto min-h-[400px] flex items-center justify-center bg-black/40">
                  <img
                    src={generatedImage.url}
                    alt={generatedImage.prompt}
                    className="max-w-full max-h-[80vh] object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-grow">
                        <p className="text-white font-medium line-clamp-2 mb-1">{generatedImage.prompt}</p>
                        <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Generated just now</p>
                      </div>
                      <button
                        onClick={() => downloadImage(generatedImage.url, generatedImage.prompt)}
                        className="p-4 rounded-2xl bg-white text-black hover:bg-slate-200 transition-colors shadow-xl"
                        title="Download Image"
                      >
                        <Download className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-2 border-dashed border-white/10 rounded-3xl p-20 flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                  <ImageIcon className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-display font-semibold text-white mb-2">Your creation will appear here</h3>
                <p className="text-slate-500 max-w-xs">
                  Enter a prompt above and click generate to start your creative journey.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History / Recent Creations */}
          {history.length > 1 && (
            <div className="mt-20">
              <h2 className="font-display text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <ImageIcon className="w-6 h-6 text-brand-purple" /> Recent Creations
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {history.slice(1).map((img) => (
                  <motion.div
                    key={img.timestamp}
                    whileHover={{ scale: 1.02 }}
                    className="group relative aspect-square rounded-2xl overflow-hidden glass cursor-pointer"
                    onClick={() => setGeneratedImage(img)}
                  >
                    <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Download 
                        className="text-white w-6 h-6" 
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(img.url, img.prompt);
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-[#030712]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center">
                <Sparkles className="text-white w-5 h-5" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-white">
                Luminary<span className="text-brand-purple">AI</span>
              </span>
            </div>
            
            <div className="flex items-center gap-6 text-slate-500">
              <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
            </div>

            <p className="text-sm text-slate-500">
              &copy; 2026 Luminary AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

