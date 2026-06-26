import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, X, Palette, Type, Image, LayoutGrid, RotateCcw, Lock, Unlock } from 'lucide-react';
import { ThemeType, FontType, AppSettings, WidgetType } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onChangeSettings: (settings: Partial<AppSettings>) => void;
  widgetVisibility: Record<WidgetType, boolean>;
  onToggleWidget: (type: WidgetType) => void;
  onResetLayout: () => void;
  onPullSync?: () => void;
  onPushSync?: () => void;
}

const PRESET_WALLPAPERS = [
  { name: 'Misty Forest', value: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1600&auto=format&fit=crop' },
  { name: 'Celestial Nebula', value: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1600&auto=format&fit=crop' },
  { name: 'Cozy Coffee', value: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1600&auto=format&fit=crop' },
  { name: 'Cyberpunk Neon', value: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop' },
  { name: 'Minimalist Wave', value: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1600&auto=format&fit=crop' },
  { name: 'Stardust Peak', value: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1600&auto=format&fit=crop' },
];

const PRESET_GRADIENTS = [
  { name: 'Frosted Aura', value: 'radial-gradient(circle at 0% 0%, #4c1d95 0%, transparent 50%), radial-gradient(circle at 100% 100%, #1e3a8a 0%, transparent 50%), radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)' },
  { name: 'Cosmic Lavender', value: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)' },
  { name: 'Sunset Aura', value: 'linear-gradient(135deg, #1e3a8a 0%, #581c87 50%, #881337 100%)' },
  { name: 'Matrix Digital', value: 'linear-gradient(180deg, #000000 0%, #050c05 100%)' },
  { name: 'Nordic Sky', value: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' },
  { name: 'Warm Amber', value: 'linear-gradient(135deg, #451a03 0%, #1e0700 100%)' },
];

export default function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
  widgetVisibility,
  onToggleWidget,
  onResetLayout,
  onPullSync,
  onPushSync
}: SettingsPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 cursor-pointer"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 text-white z-50 p-6 shadow-2xl flex flex-col h-full select-none overflow-y-auto font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-300" />
                <h2 className="text-base font-bold tracking-wider uppercase">Customize Start Page</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Layout Locker Option */}
            <div className="mb-5 p-3.5 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold tracking-wide uppercase flex items-center gap-1.5">
                  {settings.widgetsLocked ? (
                    <Lock className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Unlock className="w-4 h-4 text-amber-300" />
                  )}
                  Widget Layout {settings.widgetsLocked ? 'Locked' : 'Unlocked'}
                </h3>
                <p className="text-[10px] text-white/50 mt-1">
                  {settings.widgetsLocked ? 'Positions locked. No accidental moves.' : 'Drag headers & corners to move/resize.'}
                </p>
              </div>
              <button
                onClick={() => onChangeSettings({ widgetsLocked: !settings.widgetsLocked })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm
                  ${settings.widgetsLocked 
                    ? 'bg-emerald-500 text-white hover:bg-emerald-400' 
                    : 'bg-amber-400 text-slate-900 hover:bg-amber-300'
                  }
                `}
              >
                {settings.widgetsLocked ? 'Unlock' : 'Lock'}
              </button>
            </div>

            {/* Customize Themes */}
            <div className="mb-6">
              <h3 className="text-[11px] font-bold tracking-wider text-white/50 uppercase mb-3 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-300" />
                Aesthetic Theme
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: 'glass-light', name: 'Glass Light' },
                  { id: 'glass-dark', name: 'Frosted Glass' },
                  { id: 'cyberpunk', name: 'Cyberpunk Glow' },
                  { id: 'matrix', name: 'Matrix Terminal' },
                  { id: 'sunset-glow', name: 'Sunset Hour' },
                  { id: 'minimal-light', name: 'Paper Light' },
                ] as const).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onChangeSettings({ theme: t.id })}
                    className={`px-3 py-2 text-xs font-medium rounded-lg text-left transition-all border
                      ${settings.theme === t.id
                        ? 'bg-amber-400 border-amber-400 text-slate-950 font-bold shadow-md'
                        : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/15'
                      }
                    `}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Customize Fonts */}
            <div className="mb-6">
              <h3 className="text-[11px] font-bold tracking-wider text-white/50 uppercase mb-3 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-amber-300" />
                Typography Font
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {([
                  { id: 'sans', name: 'Inter' },
                  { id: 'mono', name: 'JetBrains' },
                  { id: 'serif', name: 'Playfair' },
                  { id: 'display', name: 'Space' },
                  { id: 'playful', name: 'Outfit' },
                ] as const).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onChangeSettings({ font: f.id })}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg text-center transition-all border
                      ${settings.font === f.id
                        ? 'bg-amber-400 border-amber-400 text-slate-950 font-bold shadow-md'
                        : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/15'
                      }
                    `}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Images */}
            <div className="mb-6">
              <h3 className="text-[11px] font-bold tracking-wider text-white/50 uppercase mb-3 flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5 text-amber-300" />
                Background Wallpaper
              </h3>
              
              {/* Wallpaper Type Switcher */}
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 mb-3.5 text-[10px]">
                {(['preset', 'solid', 'custom'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => onChangeSettings({ backgroundType: type })}
                    className={`flex-1 py-1 rounded-md font-bold capitalize transition-all
                      ${settings.backgroundType === type
                        ? 'bg-amber-400 text-slate-900 shadow-sm'
                        : 'text-white/70 hover:text-white'
                      }
                    `}
                  >
                    {type === 'solid' ? 'Colors / Gradients' : type === 'preset' ? 'Presets' : 'Custom URL'}
                  </button>
                ))}
              </div>

              {/* Preset Background Options */}
              {settings.backgroundType === 'preset' && (
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {PRESET_WALLPAPERS.map((wall, idx) => (
                    <button
                      key={idx}
                      onClick={() => onChangeSettings({ backgroundValue: wall.value })}
                      style={{ backgroundImage: `url(${wall.value})` }}
                      className={`h-16 rounded-lg bg-cover bg-center border relative overflow-hidden transition-all duration-300 group
                        ${settings.backgroundValue === wall.value 
                          ? 'border-amber-400 ring-2 ring-amber-400/50 scale-[0.98]' 
                          : 'border-white/10 hover:border-white/40'
                        }
                      `}
                    >
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-end p-1.5">
                        <span className="text-[9px] font-bold text-white tracking-wide truncate">{wall.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Solid / Gradient Options */}
              {settings.backgroundType === 'solid' && (
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_GRADIENTS.map((grad, idx) => (
                    <button
                      key={idx}
                      onClick={() => onChangeSettings({ backgroundValue: grad.value })}
                      style={{ background: grad.value }}
                      className={`h-12 rounded-lg border flex items-center justify-center transition-all duration-300
                        ${settings.backgroundValue === grad.value 
                          ? 'border-amber-400 ring-2 ring-amber-400/50 scale-[0.98]' 
                          : 'border-white/10 hover:border-white/40'
                        }
                      `}
                    >
                      <span className="text-[9px] font-bold text-white drop-shadow-md text-center px-1">{grad.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Custom Image URL Option */}
              {settings.backgroundType === 'custom' && (
                <div className="space-y-2">
                  <input
                    type="url"
                    placeholder="Enter image link (HTTPS)..."
                    value={settings.backgroundType === 'custom' ? settings.backgroundValue : ''}
                    onChange={(e) => onChangeSettings({ backgroundValue: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:border-white/50 placeholder-white/50"
                  />
                  <p className="text-[9px] text-white/40 leading-relaxed italic">
                    Paste any direct image URL. Works beautifully with high-resolution Unsplash or Pexels desktop links.
                  </p>
                </div>
              )}
            </div>

            {/* Widget Display Toggles */}
            <div className="mb-6 flex-1">
              <h3 className="text-[11px] font-bold tracking-wider text-white/50 uppercase mb-3 flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-amber-300" />
                Active widgets
              </h3>
              <div className="space-y-2 bg-white/5 p-3.5 rounded-xl border border-white/10">
                {(Object.keys(widgetVisibility) as WidgetType[]).map((type) => (
                  <div key={type} className="flex items-center justify-between text-xs">
                    <span className="font-semibold capitalize tracking-wide text-white/90">
                      {type === 'todo' ? 'To-Do Checklist' : type === 'chat' ? 'Gemini Chatbot' : type === 'quotes' ? 'Daily Quotes' : type}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={widgetVisibility[type]}
                        onChange={() => onToggleWidget(type)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-400/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-400" />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Sync Passcode */}
            <div className="mb-6">
              <h3 className="text-[11px] font-bold tracking-wider text-white/50 uppercase mb-3 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                Sync Passcode
              </h3>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter secret passcode..."
                  value={settings.syncPasscode || ''}
                  onChange={(e) => onChangeSettings({ syncPasscode: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:border-white/50 placeholder-white/50"
                />
                <div className="flex gap-2">
                  <button
                    onClick={onPushSync}
                    disabled={!settings.syncPasscode || settings.syncPasscode.trim().length === 0}
                    className="flex-1 px-3 py-2 text-[10px] font-bold uppercase text-slate-900 bg-amber-300 rounded-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Backup to Cloud
                  </button>
                  <button
                    onClick={onPullSync}
                    disabled={!settings.syncPasscode || settings.syncPasscode.trim().length === 0}
                    className="flex-1 px-3 py-2 text-[10px] font-bold uppercase text-white bg-blue-500 rounded-lg hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Restore from Cloud
                  </button>
                </div>
                <p className="text-[9px] text-white/40 leading-relaxed italic">
                  Backup to save current setup. Restore to pull setup onto this device.
                </p>
              </div>
            </div>

            {/* System Reset */}
            <div className="pt-4 border-t border-white/10 mt-auto flex flex-col gap-2.5">
              <button
                onClick={onResetLayout}
                className="flex items-center justify-center gap-1.5 text-xs text-red-400 hover:text-white bg-red-950/20 hover:bg-red-900/60 border border-red-500/30 hover:border-red-500/80 px-4 py-2 rounded-xl transition-all font-semibold"
              >
                <RotateCcw className="w-4 h-4" />
                Restore Default Layout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
