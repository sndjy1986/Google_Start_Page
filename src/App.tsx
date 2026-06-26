import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, HelpCircle, Lock, Unlock, Eye, Sparkles, RefreshCw, Layers } from 'lucide-react';

import { AppSettings, WidgetConfig, WidgetType } from './types';
import SearchBox from './components/SearchBox';
import BookmarkGrid from './components/BookmarkGrid';
import SettingsPanel from './components/SettingsPanel';
import WidgetWrapper from './components/WidgetWrapper';

// Widgets
import ClockWidget from './components/ClockWidget';
import WeatherWidget from './components/WeatherWidget';
import TodoWidget from './components/TodoWidget';
import NotesWidget from './components/NotesWidget';
import GeminiChatWidget from './components/GeminiChatWidget';
import QuotesWidget from './components/QuotesWidget';

// 1. Intercept localStorage changes to automatically back them up to our server in real-time
const nativeSetItem = localStorage.setItem;
localStorage.setItem = function (key: string, value: string) {
  nativeSetItem.apply(this, arguments as any);

  const keysToSync = [
    'google_start_settings',
    'google_start_widgets_layout',
    'google_start_bookmarks',
    'widget_todos',
    'widget_notes_content',
    'widget_chat_history',
    'quote_category',
    'clock_24h',
    'clock_seconds',
    'custom_user_name',
    'weather_location_name',
    'weather_lat',
    'weather_lon'
  ];

  if (keysToSync.includes(key)) {
    let passcode = "";
    try {
      const savedSettings = localStorage.getItem('google_start_settings');
      if (savedSettings) {
         passcode = JSON.parse(savedSettings).syncPasscode || "";
      }
    } catch(e) {}

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (passcode) {
      headers['x-sync-passcode'] = passcode;
    }

    fetch('/api/sync', {
      method: 'POST',
      headers,
      body: JSON.stringify({ key, value }),
    }).catch((err) => console.warn("Background sync failed:", err));
  }
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'glass-dark',
  font: 'sans',
  backgroundType: 'solid',
  backgroundValue: 'radial-gradient(circle at 0% 0%, #4c1d95 0%, transparent 50%), radial-gradient(circle at 100% 100%, #1e3a8a 0%, transparent 50%), radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)',
  widgetsLocked: false,
};

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'w-clock', type: 'clock', title: 'Clock & Calendar', x: 2, y: 15, w: 270, h: 185, visible: true, zIndex: 10 },
  { id: 'w-weather', type: 'weather', title: 'Local Weather', x: 74, y: 15, w: 280, h: 295, visible: true, zIndex: 10 },
  { id: 'w-todo', type: 'todo', title: 'To-Do Checklist', x: 2, y: 41, w: 270, h: 250, visible: true, zIndex: 10 },
  { id: 'w-quotes', type: 'quotes', title: 'Zen Wisdom', x: 74, y: 55, w: 280, h: 200, visible: true, zIndex: 10 },
  { id: 'w-chat', type: 'chat', title: 'Gemini Assistant', x: 33, y: 64, w: 340, h: 285, visible: true, zIndex: 15 },
  { id: 'w-notes', type: 'notes', title: 'Autosave Notes', x: 2, y: 72, w: 270, h: 215, visible: true, zIndex: 10 },
];

export default function App() {
  
  // Load settings
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Load widgets layout
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [highestZIndex, setHighestZIndex] = useState(20);
  const [isSyncLoading, setIsSyncLoading] = useState(true);

  // Load cloud/local settings
  useEffect(() => {
    async function loadData() {
      setIsSyncLoading(true);
      
      let localPasscode = "";
      const savedSettings = localStorage.getItem('google_start_settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(parsed);
          localPasscode = parsed.syncPasscode || "";
        } catch (e) {}
      }
      const savedLayout = localStorage.getItem('google_start_widgets_layout');
      if (savedLayout) {
        try {
          setWidgets(JSON.parse(savedLayout));
        } catch (e) {}
      }

      if (localPasscode) {
        try {
          const headers: Record<string, string> = {
             'x-sync-passcode': localPasscode
          };
          const res = await fetch('/api/sync', { headers });
          if (res.ok) {
            const cloudData = await res.json();
            if (Object.keys(cloudData).length > 0) {
              Object.keys(cloudData).forEach((key) => {
                nativeSetItem.call(localStorage, key, cloudData[key]);
              });
              
              const updatedSettings = localStorage.getItem('google_start_settings');
              if (updatedSettings) {
                try { setSettings(JSON.parse(updatedSettings)); } catch (e) {}
              }
              const updatedLayout = localStorage.getItem('google_start_widgets_layout');
              if (updatedLayout) {
                try { setWidgets(JSON.parse(updatedLayout)); } catch (e) {}
              }
            }
          }
        } catch (e) {
          console.error("Failed to fetch cloud sync data:", e);
        }
      }
      setIsSyncLoading(false);
    }
    loadData();
  }, []);

  // Save Settings
  const handleUpdateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('google_start_settings', JSON.stringify(updated));
  };

  const handleSync = async () => {
    if (!settings.syncPasscode || settings.syncPasscode.trim().length === 0) return;
    setIsSyncLoading(true);
    try {
      const headers: Record<string, string> = {
        'x-sync-passcode': settings.syncPasscode
      };
      const res = await fetch('/api/sync', { headers });
      if (res.ok) {
        const cloudData = await res.json();
        if (Object.keys(cloudData).length > 0) {
          Object.keys(cloudData).forEach((key) => {
            nativeSetItem.call(localStorage, key, cloudData[key]);
          });
        }
      }
    } catch (e) {
      console.error("Failed to fetch cloud sync data on manual sync:", e);
    }
    window.location.reload();
  };

  // Save Widgets
  const handleSaveWidgets = async (updatedWidgets: WidgetConfig[]) => {
    setWidgets(updatedWidgets);
    localStorage.setItem('google_start_widgets_layout', JSON.stringify(updatedWidgets));
  };

  // Toggle single widget visibility
  const handleToggleWidget = (type: WidgetType) => {
    const updated = widgets.map((w) => (w.type === type ? { ...w, visible: !w.visible } : w));
    handleSaveWidgets(updated);
  };

  // Track widget positions
  const handleMoveWidget = (id: string, x: number, y: number) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, x, y } : w));
    handleSaveWidgets(updated);
  };

  // Track widget resizing
  const handleResizeWidget = (id: string, w: number, h: number) => {
    const updated = widgets.map((widget) => (widget.id === id ? { ...widget, w, h } : widget));
    handleSaveWidgets(updated);
  };

  // Close widget
  const handleCloseWidget = (id: string) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, visible: false } : w));
    handleSaveWidgets(updated);
  };

  // Focus widget (bring to top layer)
  const handleFocusWidget = (id: string) => {
    const nextZ = highestZIndex + 1;
    setHighestZIndex(nextZ);
    const updated = widgets.map((w) => (w.id === id ? { ...w, zIndex: nextZ } : w));
    handleSaveWidgets(updated);
  };

  // Restore Default positions & options
  const handleResetLayout = () => {
    if (window.confirm('Are you sure you want to restore the default widgets layout?')) {
      handleSaveWidgets(DEFAULT_WIDGETS);
      handleUpdateSettings({ widgetsLocked: false });
    }
  };

  // Master Restore system
  const handleMasterReset = () => {
    if (window.confirm('This will wipe all custom settings, layout, bookmarks, notes, and restore your start page to default. Proceed?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Map settings to font classes
  const fontClass = {
    sans: 'font-sans',
    mono: 'font-mono',
    serif: 'font-serif',
    display: 'font-display',
    playful: 'font-playful',
  }[settings.font];

  // Map settings to theme styling
  const getThemeClass = () => {
    switch (settings.theme) {
      case 'glass-light':
        return 'bg-white/15 text-slate-950 border-white/30 backdrop-blur-xl shadow-2xl';
      case 'glass-dark':
        return 'bg-white/5 text-white border-white/10 backdrop-blur-2xl shadow-2xl';
      case 'cyberpunk':
        return 'bg-purple-950/20 text-pink-300 border-cyan-400/30 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.15)]';
      case 'matrix':
        return 'bg-black/85 text-green-400 border-green-500/30 backdrop-blur-xl font-mono';
      case 'sunset-glow':
        return 'bg-orange-950/15 text-amber-100 border-orange-500/20 backdrop-blur-xl shadow-2xl';
      case 'minimal-light':
        return 'bg-slate-50 text-slate-900 border-slate-200 shadow-sm';
      default:
        return 'bg-white/5 text-white border-white/10 backdrop-blur-2xl shadow-2xl';
    }
  };

  // Get active widget visibility map for Settings Drawer
  const activeVisibilityMap = widgets.reduce(
    (acc, w) => ({ ...acc, [w.type]: w.visible }),
    {} as Record<WidgetType, boolean>
  );

  // Render correct content inside draggable widget
  const renderWidgetContent = (type: WidgetType) => {
    switch (type) {
      case 'clock':
        return <ClockWidget />;
      case 'weather':
        return <WeatherWidget />;
      case 'todo':
        return <TodoWidget />;
      case 'notes':
        return <NotesWidget />;
      case 'chat':
        return <GeminiChatWidget />;
      case 'quotes':
        return <QuotesWidget />;
      default:
        return null;
    }
  };

  // Background inline styling
  const backgroundStyle: React.CSSProperties = {};
  if (settings.backgroundType === 'solid') {
    backgroundStyle.background = settings.backgroundValue;
  } else {
    backgroundStyle.backgroundImage = `url(${settings.backgroundValue})`;
    backgroundStyle.backgroundSize = 'cover';
    backgroundStyle.backgroundPosition = 'center';
    backgroundStyle.backgroundAttachment = 'fixed';
  }

  if (isSyncLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans text-white select-none">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <h2 className="text-[10px] font-semibold tracking-widest uppercase text-white/50">Syncing Start Page...</h2>
        </div>
      </div>
    );
  }

  return (
    <div
      style={backgroundStyle}
      className={`min-h-screen relative flex flex-col justify-between overflow-x-hidden transition-all duration-500 ${fontClass}`}
    >
      {/* Heavy background overlay for optimal readability, contrast, and accessibility */}
      <div 
        className={`absolute inset-0 z-0 pointer-events-none transition-colors duration-500
          ${settings.theme.includes('light') 
            ? 'bg-white/40 backdrop-blur-[1px]' 
            : 'bg-black/45 backdrop-blur-[1px]'
          }
        `}
      />

      {/* Persistent Elegant Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          {/* Logo / Title */}
          <div className="flex items-center gap-1.5 select-none cursor-default bg-black/25 dark:bg-black/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h1 className="text-xs font-bold uppercase tracking-wider text-white">Google Start Page</h1>
          </div>

          {/* Quick locked indicator */}
          <button
            onClick={() => handleUpdateSettings({ widgetsLocked: !settings.widgetsLocked })}
            title={settings.widgetsLocked ? 'Unlock widget movement' : 'Lock widget movement'}
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 text-white/80 hover:text-white transition-all scale-90"
          >
            {settings.widgetsLocked ? (
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Unlock className="w-3.5 h-3.5 text-amber-300" />
            )}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Master reset */}
          <button
            onClick={handleMasterReset}
            title="Wipe configuration & bookmarks"
            className="text-[10px] uppercase font-bold text-white/50 hover:text-red-400 transition-colors bg-black/25 backdrop-blur-md border border-white/5 hover:border-red-500/30 px-3 py-1.5 rounded-full shrink-0"
          >
            Reset All
          </button>

          {/* Customize Panel button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 bg-amber-400 hover:bg-amber-300 active:scale-95 border border-amber-300 px-4 py-1.5 rounded-full shadow-lg transition-all"
          >
            <Settings className="w-3.5 h-3.5 shrink-0" />
            <span>Customize</span>
          </button>
        </div>
      </header>

      {/* Main Page Layout Section */}
      <main className="flex-1 w-full relative z-10 flex flex-col justify-start pt-16 md:pt-24 pb-36 px-4">
        {/* Core Center Dashboard (Search & Bookmarks) */}
        <div className="w-full relative pointer-events-auto flex flex-col gap-8">
          <SearchBox />
          <BookmarkGrid />
        </div>

        {/* Draggable Desktop Widgets Workspace Canvas */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {widgets
            .filter((w) => w.visible)
            .map((widget) => (
              <WidgetWrapper
                key={widget.id}
                id={widget.id}
                title={widget.title}
                x={widget.x}
                y={widget.y}
                w={widget.w}
                h={widget.h}
                zIndex={widget.zIndex}
                locked={settings.widgetsLocked}
                onMove={handleMoveWidget}
                onResize={handleResizeWidget}
                onClose={() => handleCloseWidget(widget.id)}
                onFocus={() => handleFocusWidget(widget.id)}
                themeClass={getThemeClass()}
              >
                {renderWidgetContent(widget.type)}
              </WidgetWrapper>
            ))}
        </div>
      </main>

      {/* Sliding Customize Drawer Side Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onChangeSettings={handleUpdateSettings}
        widgetVisibility={activeVisibilityMap}
        onToggleWidget={handleToggleWidget}
        onResetLayout={handleResetLayout}
        onSync={handleSync}
      />

      {/* Sleek Minimal Footer */}
      <footer className="w-full text-center py-4 z-10 relative select-none">
        <p className="text-[10px] tracking-widest text-white/30 uppercase font-sans">
          Google Start Page • Gemini Interactive Hub • Crafted with React & Tailwind
        </p>
      </footer>
    </div>
  );
}
