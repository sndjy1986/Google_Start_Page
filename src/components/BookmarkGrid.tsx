import React, { useState } from 'react';
import { Plus, Trash2, ExternalLink, Link2, FolderPlus, Globe } from 'lucide-react';
import { Bookmark } from '../types';

const INITIAL_BOOKMARKS: Bookmark[] = [
  { id: '1', name: 'Google', url: 'https://google.com' },
  { id: '2', name: 'GitHub', url: 'https://github.com' },
  { id: '3', name: 'Gemini AI', url: 'https://gemini.google.com' },
  { id: '4', name: 'YouTube', url: 'https://youtube.com' },
  { id: '5', name: 'StackOverflow', url: 'https://stackoverflow.com' },
  { id: '6', name: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
  { id: '7', name: 'Tailwind CSS', url: 'https://tailwindcss.com' },
  { id: '8', name: 'Dribbble', url: 'https://dribbble.com' },
];

export default function BookmarkGrid() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('google_start_bookmarks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_BOOKMARKS;
      }
    }
    return INITIAL_BOOKMARKS;
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newBookmarkName, setNewBookmarkName] = useState('');
  const [newBookmarkUrl, setNewBookmarkUrl] = useState('');
  const [newBookmarkIcon, setNewBookmarkIcon] = useState('');

  const saveBookmarks = (list: Bookmark[]) => {
    setBookmarks(list);
    localStorage.setItem('google_start_bookmarks', JSON.stringify(list));
  };

  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookmarkName.trim() || !newBookmarkUrl.trim()) return;

    // Ensure URL has a protocol
    let formattedUrl = newBookmarkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newBM: Bookmark = {
      id: Date.now().toString(),
      name: newBookmarkName.trim(),
      url: formattedUrl,
      iconName: newBookmarkIcon.trim() || undefined,
    };

    const updated = [...bookmarks, newBM];
    saveBookmarks(updated);

    setNewBookmarkName('');
    setNewBookmarkUrl('');
    setNewBookmarkIcon('');
    setShowAddForm(false);
  };

  const handleDeleteBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = bookmarks.filter((bm) => bm.id !== id);
    saveBookmarks(updated);
  };

  // Helper to extract domain for high-resolution favicon
  const getFaviconUrl = (bookmarkUrl: string) => {
    try {
      const urlObj = new URL(bookmarkUrl);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
    } catch {
      return '';
    }
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 px-4 select-none font-sans">
      {/* Header section */}
      <div className="flex items-center justify-between mb-4 border-b border-white/15 pb-2">
        <h3 className="text-sm font-semibold tracking-wide text-white flex items-center gap-2">
          <Link2 className="w-4 h-4 text-amber-300" />
          Bookmarks
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 px-2.5 py-1 rounded-full transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {/* Add Bookmark form */}
      {showAddForm && (
        <form
          onSubmit={handleAddBookmark}
          className="mb-4 p-4 rounded-xl bg-white/10 border border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn backdrop-blur-md"
        >
          <input
            type="text"
            placeholder="Name (e.g. GitHub)"
            value={newBookmarkName}
            onChange={(e) => setNewBookmarkName(e.target.value)}
            required
            className="px-3 py-1.5 text-xs bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:border-white/50 placeholder-white/50"
          />
          <input
            type="text"
            placeholder="URL (e.g. github.com)"
            value={newBookmarkUrl}
            onChange={(e) => setNewBookmarkUrl(e.target.value)}
            required
            className="px-3 py-1.5 text-xs bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:border-white/50 placeholder-white/50"
          />
          <input
            type="text"
            placeholder="Icon (dashboardicons.com)"
            value={newBookmarkIcon}
            onChange={(e) => setNewBookmarkIcon(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:border-white/50 placeholder-white/50"
          />
          <div className="flex gap-2 sm:col-span-3">
            <button
              type="submit"
              className="flex-1 text-xs py-1.5 font-semibold bg-amber-400 text-slate-900 rounded-lg hover:bg-amber-300 transition-colors"
            >
              Save Bookmark
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs px-3 py-1.5 bg-white/10 text-white hover:bg-white/15 rounded-lg border border-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Bookmark Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 justify-items-center">
        {bookmarks.map((bm) => {
          const iconUrl = bm.iconName 
            ? `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${bm.iconName.toLowerCase()}.png`
            : getFaviconUrl(bm.url);

          return (
            <div key={bm.id} className="relative group flex flex-col items-center gap-2">
              <a
                href={bm.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-lg relative"
              >
                {/* Favicon or Avatar */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden">
                  {iconUrl ? (
                    <img
                      src={iconUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const fallback = (e.target as HTMLImageElement).nextSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                      className="w-7 h-7 object-contain rounded-lg"
                    />
                  ) : null}
                  <div
                    style={{ display: iconUrl ? 'none' : 'flex' }}
                    className="w-full h-full items-center justify-center text-xs font-bold text-white/90"
                  >
                    {getInitials(bm.name)}
                  </div>
                </div>
              </a>

              {/* Bookmark Title */}
              <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors truncate max-w-[80px] text-center">
                {bm.name}
              </span>

              {/* Delete Button */}
              <button
                onClick={(e) => handleDeleteBookmark(bm.id, e)}
                title={`Delete ${bm.name}`}
                className="absolute -top-1 -right-1 p-1 rounded-full bg-black/80 text-white/60 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all scale-75 hover:scale-100 shadow-md"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
