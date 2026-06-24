import React, { useState, useEffect, useRef } from 'react';
import { FileText, Save } from 'lucide-react';

export default function NotesWidget() {
  const [content, setContent] = useState(() => {
    return localStorage.getItem('widget_notes_content') || '';
  });
  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    setIsSaving(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      localStorage.setItem('widget_notes_content', val);
      setIsSaving(false);
    }, 800);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col h-full font-sans text-xs">
      <div className="flex items-center justify-between mb-1 text-white/50 text-[10px]">
        <div className="flex items-center gap-1.5 font-medium">
          <FileText className="w-3.5 h-3.5" />
          <span>AUTOSAVING SCRATCHPAD</span>
        </div>
        {isSaving ? (
          <span className="text-amber-300 animate-pulse">saving...</span>
        ) : (
          <span className="text-emerald-400 flex items-center gap-1">
            <Save className="w-3 h-3" /> saved
          </span>
        )}
      </div>

      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder="Write down ideas, snippets, snippets of code or phone numbers..."
        className="flex-1 w-full p-2.5 bg-white/5 dark:bg-black/20 text-white text-[11px] placeholder-white/40 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 resize-none font-mono leading-relaxed"
      />
    </div>
  );
}
