
import React, { useState, useRef, useEffect } from 'react';
import { chatWithGemini } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Button } from './Button';

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hi! I'm Sparky! Want to talk about your story?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await chatWithGemini([...messages, userMessage]);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Oops! My magic wand flickered. Can you try again?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-3xl w-80 sm:w-96 h-[500px] shadow-2xl flex flex-col overflow-hidden border-4 border-indigo-200">
          <div className="bg-indigo-500 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                ✨
              </div>
              <span className="font-bold text-lg">Sparky the Helper</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-600 rounded-full p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-indigo-50/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-500 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 rounded-tl-none border border-indigo-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-indigo-100 flex gap-1">
                  <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-indigo-100 flex gap-2">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Sparky anything..."
              className="flex-1 px-4 py-2 bg-indigo-50 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
            />
            <button 
              onClick={handleSend}
              className="p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-200 group relative"
        >
          <span className="text-2xl">✨</span>
          <span className="absolute -top-12 right-0 bg-white text-indigo-600 px-3 py-1 rounded-xl text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border-2 border-indigo-100">
            Talk to Sparky!
          </span>
        </button>
      )}
    </div>
  );
};
