import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, Link2, FolderPlus, Globe, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import { Bookmark } from '../types';

const DEFAULT_CATEGORIES = ['Home', 'Work', 'Server'];

const INITIAL_BOOKMARKS: Bookmark[] = [
  { id: '1', name: 'Google', url: 'https://google.com', category: 'Home' },
  { id: '2', name: 'GitHub', url: 'https://github.com', category: 'Work' },
  { id: '3', name: 'Gemini AI', url: 'https://gemini.google.com', category: 'Work' },
  { id: '4', name: 'YouTube', url: 'https://youtube.com', category: 'Home' },
  { id: '5', name: 'StackOverflow', url: 'https://stackoverflow.com', category: 'Work' },
  { id: '6', name: 'MDN Web Docs', url: 'https://developer.mozilla.org', category: 'Work' },
  { id: '7', name: 'Tailwind CSS', url: 'https://tailwindcss.com', category: 'Work' },
  { id: '8', name: 'Localhost', url: 'http://localhost:3000', category: 'Server' },
];

export default function BookmarkGrid() {
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('google_start_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

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
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState(categories[0] || 'Home');
  const [newBookmarkName, setNewBookmarkName] = useState('');
  const [newBookmarkUrl, setNewBookmarkUrl] = useState('');
  const [newBookmarkIcon, setNewBookmarkIcon] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  // Make sure to sync active category if categories change from another tab, or on initial load
  useEffect(() => {
    if (!categories.includes(activeCategory)) {
      setActiveCategory(categories[0] || 'Home');
    }
  }, [categories, activeCategory]);

  const saveBookmarks = (list: Bookmark[]) => {
    setBookmarks(list);
    localStorage.setItem('google_start_bookmarks', JSON.stringify(list));
  };

  const saveCategories = (list: string[]) => {
    setCategories(list);
    localStorage.setItem('google_start_categories', JSON.stringify(list));
  };

  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookmarkName.trim() || !newBookmarkUrl.trim()) return;

    let formattedUrl = newBookmarkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    if (editingBookmarkId) {
      const updated = bookmarks.map(b => b.id === editingBookmarkId ? {
        ...b,
        name: newBookmarkName.trim(),
        url: formattedUrl,
        iconName: newBookmarkIcon.trim() || undefined,
        category: activeCategory
      } : b);
      saveBookmarks(updated);
    } else {
      const newBM: Bookmark = {
        id: Date.now().toString(),
        name: newBookmarkName.trim(),
        url: formattedUrl,
        iconName: newBookmarkIcon.trim() || undefined,
        category: activeCategory,
      };

      saveBookmarks([...bookmarks, newBM]);
    }

    setNewBookmarkName('');
    setNewBookmarkUrl('');
    setNewBookmarkIcon('');
    setShowAddForm(false);
    setEditingBookmarkId(null);
  };

  const handleEditClick = (bm: Bookmark, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setNewBookmarkName(bm.name);
    setNewBookmarkUrl(bm.url);
    setNewBookmarkIcon(bm.iconName || '');
    setEditingBookmarkId(bm.id);
    setShowAddForm(true);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = newCategoryName.trim();
    if (!cat || categories.includes(cat)) return;
    
    const newCats = [...categories, cat];
    saveCategories(newCats);
    setActiveCategory(cat);
    setNewCategoryName('');
    setShowAddCategoryForm(false);
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (categories.length <= 1) return; // don't delete last category
    if (!window.confirm(`Delete category "${catToDelete}" and all its bookmarks?`)) return;

    const newCats = categories.filter(c => c !== catToDelete);
    saveCategories(newCats);
    
    const newBms = bookmarks.filter(b => b.category !== catToDelete);
    saveBookmarks(newBms);

    if (activeCategory === catToDelete) {
      setActiveCategory(newCats[0]);
    }
  };

  const moveCategory = (index: number, direction: 'left' | 'right') => {
    const newCats = [...categories];
    if (direction === 'left' && index > 0) {
      [newCats[index - 1], newCats[index]] = [newCats[index], newCats[index - 1]];
    } else if (direction === 'right' && index < newCats.length - 1) {
      [newCats[index + 1], newCats[index]] = [newCats[index], newCats[index + 1]];
    }
    saveCategories(newCats);
  };

  const handleDeleteBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = bookmarks.filter((bm) => bm.id !== id);
    saveBookmarks(updated);
  };

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

  const filteredBookmarks = bookmarks.filter((bm) => (bm.category || categories[0]) === activeCategory);

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 px-4 select-none font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 border-b border-white/15 pb-2 gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <h3 className="text-sm font-semibold tracking-wide text-white flex items-center gap-2">
            <Link2 className="w-4 h-4 text-amber-300" />
            Bookmarks
          </h3>
          <div className="flex flex-wrap items-center gap-1 bg-black/20 p-1 rounded-lg">
            {categories.map((cat, idx) => (
              <div key={cat} className="flex items-center group relative">
                <button
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${
                    activeCategory === cat
                      ? 'bg-white/20 text-white font-bold shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
                
                {/* Active category controls (move left/right, delete) */}
                {activeCategory === cat && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/80 rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button onClick={() => moveCategory(idx, 'left')} disabled={idx === 0} className="p-0.5 text-white/70 hover:text-white disabled:opacity-30">
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDeleteCategory(cat)} disabled={categories.length <= 1} className="p-0.5 text-white/70 hover:text-red-400 disabled:opacity-30 mx-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <button onClick={() => moveCategory(idx, 'right')} disabled={idx === categories.length - 1} className="p-0.5 text-white/70 hover:text-white disabled:opacity-30">
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}
              title="Add Page"
              className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 px-2.5 py-1.5 rounded-full transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Link</span>
        </button>
      </div>

      {showAddCategoryForm && (
        <form
          onSubmit={handleAddCategory}
          className="mb-4 p-3 rounded-xl bg-white/10 border border-white/20 flex items-center gap-3 animate-fadeIn backdrop-blur-md max-w-sm"
        >
          <input
            type="text"
            placeholder="New Page Name..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            required
            className="flex-1 px-3 py-1.5 text-xs bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:border-white/50 placeholder-white/50"
          />
          <button type="submit" className="text-xs py-1.5 px-3 font-semibold bg-amber-400 text-slate-900 rounded-lg hover:bg-amber-300 transition-colors">
            Add
          </button>
        </form>
      )}

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
            placeholder="Icon name or URL"
            value={newBookmarkIcon}
            onChange={(e) => setNewBookmarkIcon(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:border-white/50 placeholder-white/50"
          />
          <div className="flex gap-2 sm:col-span-3">
            <button
              type="submit"
              className="flex-1 text-xs py-1.5 font-semibold bg-amber-400 text-slate-900 rounded-lg hover:bg-amber-300 transition-colors"
            >
              Save to {activeCategory}
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
        {filteredBookmarks.map((bm) => {
          let iconUrl = getFaviconUrl(bm.url);
          if (bm.iconName) {
            if (bm.iconName.startsWith('http://') || bm.iconName.startsWith('https://')) {
              iconUrl = bm.iconName;
            } else {
              iconUrl = `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${bm.iconName.toLowerCase()}.png`;
            }
          }

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

              {/* Edit Button */}
              <button
                onClick={(e) => handleEditClick(bm, e)}
                title={`Edit ${bm.name}`}
                className="absolute -top-1 right-5 p-1 rounded-full bg-black/80 text-white/60 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-all scale-75 hover:scale-100 shadow-md"
              >
                <Edit3 className="w-2.5 h-2.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

