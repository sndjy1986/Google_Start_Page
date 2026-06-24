import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  googleStartSettings: jsonb('google_start_settings'),
  googleStartWidgetsLayout: jsonb('google_start_widgets_layout'),
  clock24h: boolean('clock_24h').default(false),
  clockSeconds: boolean('clock_seconds').default(true),
  weatherLocationName: text('weather_location_name').default('San Francisco, USA'),
  weatherLat: text('weather_lat').default('37.7749'),
  weatherLon: text('weather_lon').default('-122.4194'),
  googleStartBookmarks: jsonb('google_start_bookmarks'),
  widgetTodos: jsonb('widget_todos'),
  widgetNotesContent: text('widget_notes_content'),
  widgetChatHistory: jsonb('widget_chat_history'),
  quoteCategory: text('quote_category').default('zen'),
});

export const usersRelations = relations(users, ({ one }) => ({
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  })
}));
