
import React, { useState, useEffect } from 'react';
import { generateStory } from './services/geminiService';
import { Story, ImageSize } from './types';
import { StoryBook } from './components/StoryBook';
import { ChatBot } from './components/ChatBot';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setApiKeySelected(hasKey);
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success as per instructions
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
      if (err.message?.includes("Requested entity was not found")) {
        setApiKeySelected(false);
        setError("API Key error. Please re-select your key.");
      } else {
        setError("Magic failed today! Try a different story prompt.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!apiKeySelected) {
    return (
      <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl max-w-md w-full border-b-8 border-indigo-200">
          <div className="text-6xl mb-6">🪄</div>
          <h1 className="text-4xl font-bold text-indigo-600 mb-4">Magic Awaits!</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            To start our story-making adventure, we need a special "Magic Key" from your parents.
          </p>
          <Button onClick={handleSelectKey} size="lg" className="w-full">
            Connect to Magic
          </Button>
          <p className="mt-6 text-xs text-gray-400">
            Note: This app uses high-quality image models. Please select a key from a paid GCP project. 
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline ml-1">Learn more</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md sticky top-0 z-40 border-b border-indigo-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📖</span>
          <h1 className="text-2xl font-black text-indigo-500 tracking-tight">DreamWeaver</h1>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-xs font-bold text-indigo-300 uppercase hidden sm:block">Image Quality:</span>
           <select 
              value={imageSize} 
              onChange={(e) => setImageSize(e.target.value as ImageSize)}
              className="bg-indigo-50 border-none rounded-full px-4 py-1 text-sm font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-300"
            >
              <option value="1K">1K Quality</option>
              <option value="2K">2K Quality</option>
              <option value="4K">4K Quality</option>
           </select>
        </div>
      </header>

      <main>
        {!story ? (
          <div className="max-w-2xl mx-auto mt-16 px-6">
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">What shall we imagine today?</h2>
              <p className="text-xl text-gray-500">Type an idea and let the magic weave your story!</p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-indigo-400 uppercase tracking-widest ml-4">Story Theme</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Example: A brave kitten who discovers a hidden world in the garden..."
                  className="w-full h-40 p-6 bg-indigo-50/50 rounded-3xl border-2 border-transparent focus:border-indigo-300 focus:outline-none text-xl placeholder:text-gray-300 transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}

              <Button 
                onClick={handleGenerateStory} 
                isLoading={isLoading}
                disabled={!prompt.trim()}
                size="lg" 
                className="w-full h-16 text-xl"
              >
                ✨ Create My Story ✨
              </Button>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {["Space Adventure", "Forest Friends", "Talking Dragons", "Ocean Quest", "Magic School"].map(suggestion => (
                  <button 
                    key={suggestion}
                    onClick={() => setPrompt(`A story about ${suggestion.toLowerCase()}`)}
                    className="p-3 bg-gray-50 hover:bg-indigo-50 rounded-xl text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium text-center"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <StoryBook 
            story={story} 
            imageSize={imageSize} 
            onNewStory={() => setStory(null)} 
          />
        )}
      </main>

      <ChatBot />
      
      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 right-0 -z-10 h-64 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-300 rounded-full -ml-20 -mb-20 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300 rounded-full -mr-20 -mb-20 blur-3xl"></div>
      </div>
    </div>
  );
};

export default App;
