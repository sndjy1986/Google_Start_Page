import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RefreshCw, Bot } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function GeminiChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('widget_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback to start message
      }
    }
    return [
      { role: 'assistant', content: "Hi there! I'm your Gemini AI companion. Ask me to brainstorm ideas, write a quick snippet, summarize notes, or answer any trivia!" },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    localStorage.setItem('widget_chat_history', JSON.stringify(messages));
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok) throw new Error('Failed to get response.');

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.warn(err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I had trouble communicating with the server. Please verify your internet connection or check the backend console." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      { role: 'assistant', content: "Chat cleared! What shall we talk about next?" },
    ]);
  };

  return (
    <div className="flex flex-col h-full font-sans text-xs min-h-0">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mb-2 min-h-0">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col max-w-[85%] rounded-xl px-2.5 py-1.5 leading-relaxed text-[11px]
              ${m.role === 'user' 
                ? 'bg-amber-400 text-slate-900 ml-auto rounded-tr-none' 
                : 'bg-white/10 text-white mr-auto rounded-tl-none border border-white/5'
              }
            `}
          >
            <span className="font-bold text-[9px] uppercase tracking-wider opacity-60 mb-0.5">
              {m.role === 'user' ? 'You' : 'Gemini'}
            </span>
            <span>{m.content}</span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-1.5 text-white/50 py-1 pl-1">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span className="text-[10px]">Gemini is typing...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Gemini anything..."
          disabled={isLoading}
          className="flex-1 px-2.5 py-1.5 bg-white/10 dark:bg-black/20 text-white rounded-lg border border-white/20 focus:outline-none focus:border-white/50 placeholder-white/50 disabled:opacity-50 text-[11px]"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-3 bg-amber-400 text-slate-900 rounded-lg hover:bg-amber-300 transition-colors disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Clear Chat */}
      <button
        onClick={handleClear}
        className="text-[9px] text-white/40 hover:text-white mt-1.5 text-right font-medium transition-colors cursor-pointer"
      >
        Clear Chat History
      </button>
    </div>
  );
}
