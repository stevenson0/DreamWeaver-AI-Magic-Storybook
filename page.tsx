
'use client';

import React, { useState, useEffect } from 'react';
import { Story, ImageSize } from './types';
import { generateStory } from './lib/gemini';
import { StoryBook } from './components/StoryBook';
import { ChatBot } from './components/ChatBot';
import { Button } from './components/Button';

const STORAGE_KEY = 'dreamweaver_current_story';
const SETTINGS_KEY = 'dreamweaver_settings';

export default function Page() {
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');

  useEffect(() => {
    const checkStatus = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
      }
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) setImageSize(savedSettings as ImageSize);

      const savedStory = localStorage.getItem(STORAGE_KEY);
      if (savedStory) {
        try {
          setStory(JSON.parse(savedStory));
        } catch (e) {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    };
    checkStatus();
  }, []);

  useEffect(() => {
    if (story) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(story));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('dreamweaver_current_page');
    }
  }, [story]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, imageSize);
  }, [imageSize]);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Mitigation for race condition as per guidelines
      setApiKeySelected(true);
    }
  };

  const handleGenerateStory = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const newStory = await generateStory(prompt);
      setStory(newStory);
    } catch (err: any) {
      console.error(err);
      // Handling required reset for paid project errors
      if (err.message?.includes("Requested entity was not found")) {
        setApiKeySelected(false);
        setError("Magic Key lost! Ask parents to reconnect.");
      } else {
        setError("The story sprites got tangled. Try again!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!apiKeySelected) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl max-w-md w-full border-b-8 border-indigo-200 transform transition-all hover:scale-[1.02]">
          <div className="text-7xl mb-6 animate-bounce">🪄</div>
          <h1 className="text-4xl font-bold text-indigo-600 mb-4">Magic Awaits!</h1>
          <p className="text-gray-600 mb-8 leading-relaxed text-lg">
            Every story wizard needs a key. Ask your parents to open the magic vault!
          </p>
          <Button onClick={handleSelectKey} size="lg" className="w-full py-6 text-xl shadow-indigo-200 active:scale-95">
            Open Magic Vault
          </Button>
          <div className="mt-8 p-4 bg-indigo-50 rounded-2xl text-[10px] text-indigo-400 font-bold uppercase tracking-widest leading-loose">
            {/* Added mandatory link to billing documentation as required by the GenAI API Key Selection rules */}
            Uses high-quality visuals. Paid API key recommended.
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline ml-1 block">Learn about billing</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 min-h-screen">
      {!story ? (
        <div className="max-w-3xl mx-auto space-y-8 md:space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-7xl font-black text-gray-800 tracking-tight leading-tight">
              Let's <span className="text-indigo-500 inline-block hover:scale-110 transition-transform">Imagine!</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-500 font-medium max-w-xl mx-auto">
              What kind of magical adventure shall we weave today?
            </p>
          </div>

          <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-2xl border border-indigo-50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 pointer-events-none"></div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">Story Idea</label>
                  <select 
                    value={imageSize} 
                    onChange={(e) => setImageSize(e.target.value as ImageSize)}
                    className="bg-gray-100 border-none rounded-full px-3 py-1 text-[10px] font-black text-gray-600 focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                  >
                    <option value="1K">1K Fast</option>
                    <option value="2K">2K Better</option>
                    <option value="4K">4K Magic</option>
                  </select>
                </div>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Example: A tiny dragon who discovers a library made of chocolate..."
                  className="w-full h-40 md:h-48 p-6 md:p-8 bg-indigo-50/30 rounded-[2rem] border-2 border-transparent focus:border-indigo-200 focus:bg-white focus:outline-none text-xl md:text-2xl placeholder:text-gray-300 transition-all shadow-inner"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-bold border border-red-100 animate-shake">
                   Oops! {error}
                </div>
              )}

              <Button 
                onClick={handleGenerateStory} 
                isLoading={isLoading}
                disabled={!prompt.trim()}
                size="lg" 
                className="w-full h-20 text-xl md:text-2xl shadow-xl shadow-indigo-100 active:scale-95"
              >
                {isLoading ? '🪄 Mixing Stardust...' : '✨ Create My Story ✨'}
              </Button>

              <div className="pt-2">
                <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Magic Starters:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["Space Kitten", "Forest Friends", "Baking Dragon", "Robot Hero", "Candy Clouds"].map(tag => (
                    <button 
                      key={tag}
                      onClick={() => setPrompt(`A story about a ${tag.toLowerCase()}`)}
                      className="px-4 py-2 bg-gray-50 hover:bg-indigo-500 hover:text-white rounded-full text-xs text-gray-400 transition-all font-bold border border-gray-100 hover:border-indigo-400"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in slide-in-from-bottom-4 duration-1000">
          <StoryBook 
            story={story} 
            imageSize={imageSize} 
            onNewStory={() => setStory(null)} 
          />
        </div>
      )}

      <ChatBot />
    </div>
  );
}
