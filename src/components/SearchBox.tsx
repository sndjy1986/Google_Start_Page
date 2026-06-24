import React, { useState } from 'react';
import { Search, Sparkles, Compass, Globe, HelpCircle } from 'lucide-react';

interface Engine {
  name: string;
  url: string;
  queryParam: string;
  placeholder: string;
  logo: string;
}

const SEARCH_ENGINES: Engine[] = [
  { name: 'Google', url: 'https://www.google.com/search', queryParam: 'q', placeholder: 'Search Google or type a URL...', logo: 'G' },
  { name: 'DuckDuckGo', url: 'https://duckduckgo.com/', queryParam: 'q', placeholder: 'Search privately with DuckDuckGo...', logo: '🦆' },
  { name: 'Bing', url: 'https://www.bing.com/search', queryParam: 'q', placeholder: 'Search Bing...', logo: 'b' },
];

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [activeEngineIdx, setActiveEngineIdx] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([
    'Vite + React development',
    'Tailwind CSS tricks',
    'Google Gemini AI models',
    'Animated SVGs with Framer Motion',
  ]);

  const engine = SEARCH_ENGINES[activeEngineIdx];

  const handleSuggestClick = (suggest: string) => {
    setQuery(suggest);
    // Submit search instantly
    const searchUrl = `${engine.url}?${engine.queryParam}=${encodeURIComponent(suggest)}`;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  const cycleEngine = () => {
    setActiveEngineIdx((prev) => (prev + 1) % SEARCH_ENGINES.length);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none font-sans">
      {/* Engine Logo Indicator */}
      <div className="flex items-center gap-2 mb-4">
        {engine.name === 'Google' ? (
          <div className="flex items-center text-3xl font-extrabold tracking-tight select-none">
            <span className="text-blue-500">G</span>
            <span className="text-red-500">o</span>
            <span className="text-yellow-500">o</span>
            <span className="text-blue-500">g</span>
            <span className="text-green-500">l</span>
            <span className="text-red-500">e</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-2xl font-bold text-white tracking-wide">
            <span className="text-xl">{engine.logo}</span>
            <span>{engine.name}</span>
          </div>
        )}
        <button
          type="button"
          onClick={cycleEngine}
          title="Switch search engine"
          className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 dark:bg-black/20 text-white/70 hover:bg-white/20 hover:text-white transition-all ml-1.5 border border-white/10"
        >
          Switch
        </button>
      </div>

      {/* Main Search Form */}
      <form
        action={engine.url}
        method="GET"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full relative flex items-center group"
      >
        <div className="absolute left-5">
          <Search className="w-5 h-5 text-white/40 group-focus-within:text-indigo-400 transition-colors" />
        </div>
        <input
          type="text"
          name={engine.queryParam}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={engine.placeholder}
          required
          className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl py-4.5 pl-14 pr-24 text-base outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all placeholder:text-white/30 font-light shadow-2xl text-white"
        />
        <div className="absolute right-4 flex items-center gap-2">
          <kbd className="hidden sm:inline-block px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-white/40 font-mono">
            CMD+K
          </kbd>
          <button
            type="submit"
            className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
            title="Search"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </button>
        </div>
      </form>

      {/* Suggestions and brainstorm helper */}
      <div className="w-full flex flex-col items-center mt-3.5">
        <div className="flex items-center gap-1.5 text-[10px] text-white/60 mb-2 font-medium uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5 text-amber-300" />
          <span>Quick Developer Prompts</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2 max-w-lg">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSuggestClick(s)}
              className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 transition-all duration-200"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
