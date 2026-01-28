
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Story, ImageSize, AspectRatio } from '../types';
import { generateIllustration, generateSpeech } from '../lib/gemini';
import { decodeBase64, decodeAudioData } from '../services/audioService';
import { Button } from './Button';

const PAGE_STORAGE_KEY = 'dreamweaver_current_page';

interface StoryBookProps {
  story: Story;
  imageSize: ImageSize;
  onNewStory: () => void;
}

export const StoryBook: React.FC<StoryBookProps> = ({ story, imageSize, onNewStory }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(() => {
    const saved = localStorage.getItem(PAGE_STORAGE_KEY);
    const parsed = saved ? parseInt(saved, 10) : 0;
    return parsed >= 0 && parsed < story.pages.length ? parsed : 0;
  });
  
  const [images, setImages] = useState<Record<number, string>>({});
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("3:4");
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const currentPage = story.pages[currentPageIndex];

  // Detect aspect ratio based on device orientation
  useEffect(() => {
    const updateRatio = () => {
      setAspectRatio(window.innerWidth < 768 ? "3:4" : "1:1");
    };
    updateRatio();
    window.addEventListener('resize', updateRatio);
    return () => window.removeEventListener('resize', updateRatio);
  }, []);

  const playPop = useCallback(() => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, []);

  useEffect(() => {
    localStorage.setItem(PAGE_STORAGE_KEY, currentPageIndex.toString());
  }, [currentPageIndex]);

  const stopAudio = useCallback(() => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch (e) {}
      audioSourceRef.current = null;
    }
    setIsReading(false);
  }, []);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const loadPageContent = useCallback(async (index: number) => {
    if (!images[index]) {
      setIsLoadingImage(true);
      try {
        const url = await generateIllustration(story.pages[index].illustrationPrompt, imageSize, aspectRatio);
        setImages(prev => ({ ...prev, [index]: url }));
      } catch (error) {
        console.error("Image generation failed", error);
      } finally {
        setIsLoadingImage(false);
      }
    }
  }, [images, story.pages, imageSize, aspectRatio]);

  useEffect(() => {
    loadPageContent(currentPageIndex);
    return () => stopAudio();
  }, [currentPageIndex, loadPageContent, stopAudio]);

  const handleReadAloud = async () => {
    const ctx = initAudioContext();
    playPop();

    if (isReading) {
      stopAudio();
      return;
    }

    setIsReading(true);
    try {
      const base64 = await generateSpeech(currentPage.text);
      const audioData = decodeBase64(base64);
      const audioBuffer = await decodeAudioData(audioData, ctx, 24000, 1);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsReading(false);
      
      audioSourceRef.current = source;
      source.start();
    } catch (error) {
      console.error("Speech generation failed", error);
      setIsReading(false);
    }
  };

  const nextPage = () => {
    if (currentPageIndex < story.pages.length - 1) {
      initAudioContext();
      stopAudio();
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) {
      initAudioContext();
      stopAudio();
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 md:py-8 h-full flex flex-col">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-stretch flex-1">
        {/* Left Side: Magic Illustration */}
        <div className="flex-1 min-h-[40vh] md:min-h-[500px] bg-white p-4 rounded-[2.5rem] shadow-2xl border-4 border-white relative overflow-hidden flex items-center justify-center transform transition-all duration-700 hover:scale-[1.01]">
          {isLoadingImage ? (
            <div className="text-center space-y-4">
              <div className="text-6xl animate-bounce">🎨</div>
              <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs animate-pulse">Mixing magic colors...</p>
            </div>
          ) : images[currentPageIndex] ? (
            <div className="w-full h-full relative group">
              <img 
                src={images[currentPageIndex]} 
                alt="Magic illustration" 
                className="w-full h-full object-cover rounded-3xl animate-ken-burns"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 rounded-3xl pointer-events-none"></div>
            </div>
          ) : (
            <div className="text-indigo-100 font-bold text-center">
               <div className="text-6xl mb-2 opacity-20">📖</div>
               <p>Waiting for the wizard...</p>
            </div>
          )}
        </div>

        {/* Right Side: Story Text & Controls */}
        <div className="flex-1 bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border-l-[12px] md:border-l-[20px] border-indigo-400 flex flex-col justify-between relative">
          <div className="absolute top-4 right-8 bg-indigo-50 text-indigo-400 px-3 py-1 rounded-full text-xs font-black tracking-tighter shadow-inner">
            PAGE {currentPageIndex + 1} OF {story.pages.length}
          </div>
          
          <div className="space-y-6 md:space-y-10 mt-4 overflow-y-auto max-h-[60vh] lg:max-h-none pr-2 custom-scrollbar">
            <h2 className="text-3xl md:text-4xl font-black text-indigo-600 leading-tight">{story.title}</h2>
            <p className="text-xl md:text-3xl leading-relaxed text-gray-700 font-medium selection:bg-pink-100">
              {currentPage.text}
            </p>
          </div>

          <div className="mt-8 md:mt-12 flex flex-col gap-4">
            <Button 
              variant="secondary" 
              className="w-full py-4 md:py-6 text-xl md:text-2xl shadow-pink-200 group active:scale-90"
              onClick={handleReadAloud}
              disabled={isLoadingImage}
            >
              <span className="mr-2 group-hover:animate-bounce inline-block">
                {isReading ? '⏹' : '🔊'}
              </span>
              {isReading ? 'Stop Reading' : 'Listen to Page'}
            </Button>

            <div className="flex gap-4">
              <Button 
                variant="ghost" 
                className="flex-1 !text-indigo-400 !bg-indigo-50 hover:!bg-indigo-100 h-14 md:h-16 rounded-3xl"
                onClick={prevPage}
                disabled={currentPageIndex === 0}
              >
                Go Back
              </Button>
              <Button 
                variant="primary" 
                className="flex-1 h-14 md:h-16 text-lg md:text-xl rounded-3xl shadow-indigo-100"
                onClick={nextPage}
                disabled={currentPageIndex === story.pages.length - 1}
              >
                {currentPageIndex === story.pages.length - 1 ? 'End' : 'Next Page'}
              </Button>
            </div>
            
            <button 
              onClick={onNewStory}
              className="mt-4 text-indigo-300 hover:text-indigo-500 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 group"
            >
              <span className="group-hover:rotate-180 transition-transform duration-500 inline-block">🪄</span>
              Start a new adventure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
