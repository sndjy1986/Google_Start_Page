export interface Bookmark {
  id: string;
  name: string;
  url: string;
  iconName?: string;
  category?: string;
}

export type WidgetType = 'clock' | 'weather' | 'notes' | 'todo' | 'chat' | 'quotes';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  x: number; // Percentage of container width (0 to 100)
  y: number; // Percentage of container height (0 to 100)
  w: number; // Width in pixels
  h: number; // Height in pixels
  visible: boolean;
  zIndex: number;
}

export type ThemeType = 'glass-light' | 'glass-dark' | 'cyberpunk' | 'matrix' | 'sunset-glow' | 'minimal-light';

export type FontType = 'sans' | 'mono' | 'serif' | 'display' | 'playful';

export interface AppSettings {
  theme: ThemeType;
  font: FontType;
  backgroundType: 'preset' | 'custom' | 'solid';
  backgroundValue: string;
  widgetsLocked: boolean;
  syncPasscode?: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}
