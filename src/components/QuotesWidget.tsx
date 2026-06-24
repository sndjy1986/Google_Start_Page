import React, { useState, useEffect } from 'react';
import { Quote, RefreshCw } from 'lucide-react';

interface QuoteData {
  quote: string;
  author: string;
}

export default function QuotesWidget() {
  const [category, setCategory] = useState<'zen' | 'motivation' | 'coding' | 'funny'>(() => {
    return (localStorage.getItem('quote_category') as any) || 'zen';
  });
  const [data, setData] = useState<QuoteData>({
    quote: "Silence is a source of great strength.",
    author: "Lao Tzu"
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuote = async (cat: typeof category) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: cat }),
      });
      if (!res.ok) throw new Error('Quote API failed.');
      const qData = await res.json();
      setData(qData);
    } catch (err) {
      console.warn(err);
      setData({
        quote: "Breathe in, breathe out. This moment is all there is.",
        author: "Zen Philosophy"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote(category);
  }, [category]);

  const handleCategoryChange = (cat: typeof category) => {
    setCategory(cat);
    localStorage.setItem('quote_category', cat);
  };

  return (
    <div className="flex flex-col justify-between h-full text-white font-sans text-xs">
      {/* Category selector */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1.5 scrollbar-thin">
        {(['zen', 'motivation', 'coding', 'funny'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize transition-all border
              ${category === cat
                ? 'bg-amber-400 text-slate-900 border-amber-400 font-semibold shadow-sm'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:text-white text-white/70'
              }
            `}
          >
            {cat}
          </button>
        ))}
        <button
          onClick={() => fetchQuote(category)}
          disabled={isLoading}
          title="Get another quote"
          className="p-1 rounded bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all ml-auto shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Quote Display */}
      <div className="flex-1 flex flex-col justify-center py-2 relative">
        <Quote className="absolute -top-1 -left-1 w-7 h-7 text-white/5 rotate-180 pointer-events-none" />
        <p className="text-[11.5px] leading-relaxed italic text-white/90 font-medium pl-3 border-l-2 border-amber-300">
          "{data.quote}"
        </p>
        <span className="text-[10px] text-white/60 font-semibold self-end mt-2 tracking-wider">
          — {data.author}
        </span>
      </div>
    </div>
  );
}
