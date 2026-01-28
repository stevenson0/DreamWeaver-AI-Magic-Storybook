
import React from 'react';

/**
 * Root Layout component mimicking Next.js app/layout.tsx
 * Handles global font application and shared background/header UI.
 */
// Added '?' to make children optional, fixing the error in index.tsx where it's reported as missing.
export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fdf2f8] text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-200 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-pink-200 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-purple-100 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '10s' }}></div>
      </div>

      <header className="bg-white/60 backdrop-blur-md sticky top-0 z-40 border-b border-indigo-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-spin-slow" style={{ animationDuration: '8s' }}>📖</span>
          <h1 className="text-2xl font-black text-indigo-500 tracking-tight">DreamWeaver</h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-white/50 rounded-full border border-indigo-50 shadow-inner">
          <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Magic Status</span>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs font-semibold text-indigo-600">Active</span>
        </div>
      </header>

      <main className="relative z-10">
        {children}
      </main>

      <footer className="py-8 text-center text-indigo-300 text-sm font-medium">
        Made with ✨ and AI for curious minds
      </footer>
    </div>
  );
}
