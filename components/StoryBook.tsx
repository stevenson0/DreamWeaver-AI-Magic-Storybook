
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Story, ImageSize } from '../types';
import { generateIllustration, generateSpeech } from '../services/geminiService';
import { decodeBase64, decodeAudioData } from '../services/audioService';
import { Button } from './Button';

interface StoryBookProps {
  story: Story;
  imageSize: ImageSize;
  onNewStory: () => void;
}

export const StoryBook: React.FC<StoryBookProps> = ({ story, imageSize, onNewStory }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [images, setImages] = useState<Record<number, string>>({});
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const currentPage = story.pages[currentPageIndex];

  const stopAudio = useCallback(() => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setIsReading(false);
  }, []);

  const loadPageContent = useCallback(async (index: number) => {
    if (!images[index]) {
      setIsLoadingImage(true);
      try {
        const url = await generateIllustration(story.pages[index].illustrationPrompt, imageSize);
        setImages(prev => ({ ...prev, [index]: url }));
      } catch (error) {
        console.error("Image generation failed", error);
      } finally {
        setIsLoadingImage(false);
      }
    }
  }, [images, story.pages, imageSize]);

  useEffect(() => {
    loadPageContent(currentPageIndex);
    return () => stopAudio();
  }, [currentPageIndex, loadPageContent, stopAudio]);

  const handleReadAloud = async () => {
    if (isReading) {
      stopAudio();
      return;
    }

    setIsReading(true);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const ctx = audioContextRef.current;
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
      stopAudio();
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) {
      stopAudio();
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 items-stretch">
        {/* Illustration Section */}
        <div className="flex-1 bg-white p-4 rounded-[2rem] shadow-2xl border-8 border-white relative min-h-[400px] flex items-center justify-center overflow-hidden">
          {isLoadingImage ? (
            <div className="flex flex-col items-center gap-4 animate-pulse">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">🎨</div>
              <p className="text-indigo-400 font-bold">Drawing page {currentPageIndex + 1}...</p>
            </div>
          ) : images[currentPageIndex] ? (
            <img 
              src={images[currentPageIndex]} 
              alt="Story illustration" 
              className="w-full h-full object-cover rounded-2xl transition-opacity duration-500 animate-ken-burns"
            />
          ) : (
            <div className="text-center text-gray-400">Failed to load image.</div>
          )}
        </div>

        {/* Text Section */}
        <div className="flex-1 bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl border-l-[12px] border-indigo-400 flex flex-col justify-between relative">
          <div className="absolute top-4 right-8 text-indigo-300 font-bold text-xl">
            {currentPageIndex + 1} / {story.pages.length}
          </div>
          
          <div className="space-y-6 pt-6">
            <h2 className="text-3xl font-bold text-indigo-600 mb-2">{story.title}</h2>
            <p className="text-2xl leading-relaxed text-gray-700 font-medium">
              {currentPage.text}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <Button 
              variant="secondary" 
              className="w-full py-4 text-xl flex gap-3"
              onClick={handleReadAloud}
              disabled={isLoadingImage}
            >
              {isReading ? '⏹ Stop Reading' : '🔊 Read Aloud'}
            </Button>

            <div className="flex gap-4">
              <Button 
                variant="ghost" 
                className="flex-1 !text-indigo-600 !bg-indigo-50 hover:!bg-indigo-100"
                onClick={prevPage}
                disabled={currentPageIndex === 0}
              >
                Previous
              </Button>
              <Button 
                variant="primary" 
                className="flex-1"
                onClick={nextPage}
                disabled={currentPageIndex === story.pages.length - 1}
              >
                Next Page
              </Button>
            </div>
            
            <button 
              onClick={onNewStory}
              className="mt-4 text-gray-400 hover:text-indigo-500 underline text-sm font-medium"
            >
              Start over and create a new story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
