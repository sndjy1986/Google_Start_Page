import React, { useState, useEffect } from 'react';
import { BookOpen, RefreshCw, Settings, Type } from 'lucide-react';

interface WordData {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  example: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
];

export default function WordOfDayWidget() {
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('word_of_day_lang') || 'en';
  });

  const fetchWord = async (lang: string) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await fetch('/api/gemini/word-of-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang }),
      });
      if (!res.ok) throw new Error('Failed to fetch word');
      
      const data = await res.json();
      setWordData(data);
    } catch (err) {
      console.warn(err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWord(language);
  }, [language]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    localStorage.setItem('word_of_day_lang', newLang);
    setIsSettingsOpen(false);
  };

  return (
    <div className="flex flex-col h-full text-white font-sans relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-white/50 text-[10px] font-semibold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Word of the Day</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => fetchWord(language)}
            className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
            title="Refresh Word"
            disabled={isLoading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
            title="Widget Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isSettingsOpen ? (
        <div className="flex-1 flex flex-col justify-center gap-3 animate-fadeIn">
          <label className="text-xs font-semibold text-white/80">Select Language</label>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="w-full bg-white/10 border border-white/20 text-white text-xs rounded-lg p-2 focus:outline-none focus:border-white/50"
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                {l.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="w-full text-xs py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors mt-2"
          >
            Done
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center animate-fadeIn min-h-0">
          {isLoading && !wordData ? (
             <div className="flex flex-col items-center justify-center text-white/60">
               <Type className="w-6 h-6 animate-pulse mb-2 text-white/40" />
               <span className="text-[10px]">Finding a word...</span>
             </div>
          ) : isError || !wordData ? (
             <div className="text-xs text-red-300 text-center">
               Failed to fetch word. Try again.
             </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-none break-words">
                  {wordData.word}
                </h3>
                {wordData.phonetic && (
                  <span className="text-xs text-amber-300 font-mono">{wordData.phonetic}</span>
                )}
              </div>
              
              <div className="text-[10px] font-semibold text-white/50 uppercase tracking-widest mb-2 border-b border-white/10 pb-1">
                {wordData.partOfSpeech}
              </div>
              
              <div className="flex-1 overflow-y-auto pr-1 text-xs space-y-2 custom-scrollbar">
                <p className="text-white/90 leading-relaxed font-medium">
                  {wordData.definition}
                </p>
                
                {wordData.example && (
                  <p className="text-white/60 italic leading-relaxed pl-2 border-l-2 border-white/20">
                    "{wordData.example}"
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
