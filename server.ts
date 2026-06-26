import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(express.json());

// Initialize GoogleGenAI client lazily & safely
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    let apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      apiKey = apiKey.trim();
    }
    // All real Google API keys start with 'AIzaSy'. Check for this to prevent invalid credentials initialization
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "undefined" && apiKey !== "null" && apiKey.length > 10) {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
      });
    } else {
      console.warn("Gemini API key is missing, empty, or invalid. Initializing in high-quality offline demo mode.");
    }
  }
  return aiClient;
}

// 1. API: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 2. API: Gemini AI Chat widget proxy
const CHAT_FALLBACKS = [
  "I'm temporarily catching my breath due to high cosmic traffic (Gemini API rate limit/unavailable)! 🧘 Let's take a quick 10-second pause, and try sending your message again. I'm always eager to chat!",
  "My creative circuits are briefly recharging. ⚡ Let's give it a few seconds and try again! In the meantime, take a deep breath and relax.",
  "High demand detected on my end! Spikes are temporary. Let's wait a moment and try that prompt again. I'm excited to brainstorm with you!"
];

app.post("/api/gemini/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  const client = getGeminiClient();
  if (!client) {
    return res.json({
      reply: "Hi there! I'm your Gemini Assistant. It looks like the Gemini API key is not configured in the Secrets panel yet, so I'm running in offline demo mode. Drop me a question once the key is set up!",
    });
  }

  try {
    // Reconstruct the chat or send the prompt
    // For simplicity, we can feed the conversation history to the model
    const formattedHistory = messages.map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join("\n");
    const systemInstruction = "You are a friendly, witty personal companion on the user's custom browser start page. Give concise, interesting, and direct answers, keeping them short (under 4-5 sentences) and helpful.";

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${formattedHistory}\nAssistant:`,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text || "I'm not sure how to respond to that." });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    const fallbackMsg = CHAT_FALLBACKS[Math.floor(Math.random() * CHAT_FALLBACKS.length)];
    res.json({ reply: fallbackMsg });
  }
});

// Helper for offline weather commentary
function getOfflineWeatherAdvice(location: string, temp: number, condition: string, unit: string = "C"): string {
  const cond = (condition || "").toLowerCase();
  
  // Convert temp to Celsius for threshold checks if passed as Fahrenheit
  const celsiusTemp = unit === "F" ? (temp - 32) * 5 / 9 : temp;
  const displayTemp = `${Math.round(temp)}°${unit}`;

  if (cond.includes("rain") || cond.includes("shower") || cond.includes("drizzle") || cond.includes("storm") || cond.includes("wet")) {
    const rainOptions = [
      `Rainy days in ${location} are perfect for lo-fi beats, warm coffee, and checking off tasks inside! ☕`,
      `Let the rain wash away yesterday's bugs. A cozy day to code or read in ${location}! 🌧️`,
      `Cozy up! It is raining in ${location}. Perfect excuse to stay indoors and build something spectacular.`
    ];
    return rainOptions[Math.floor(Math.random() * rainOptions.length)];
  }

  if (cond.includes("snow") || cond.includes("freeze") || cond.includes("ice") || celsiusTemp < 0) {
    return `Brrr! Freezing cold in ${location} (${displayTemp}). Bundle up like a well-packaged code bundle! ❄️`;
  }

  if (celsiusTemp > 30) {
    const hotOptions = [
      `Whew, ${displayTemp} in ${location}! Stay hydrated and let your genius ideas sizzle indoors. ☀️`,
      `Sun's out, heat is on! Grab an iced tea and keep cool while you conquer the day. 🍹`,
      `High temperatures detected in ${location}! Keep your laptop cool and your mind cooler.`
    ];
    return hotOptions[Math.floor(Math.random() * hotOptions.length)];
  }

  if (celsiusTemp < 15) {
    const coolOptions = [
      `Crisp and fresh air in ${location} (${displayTemp}). Grab a cozy sweater and let's get things done! 🧥`,
      `Cozy season is in full swing. Perfect temperature for hyper-focusing on your best work!`,
      `Chilly vibes in ${location} today. Keep warm, stay positive, and have an amazing day!`
    ];
    return coolOptions[Math.floor(Math.random() * coolOptions.length)];
  }

  // Mild & pleasant weather
  const pleasantOptions = [
    `A gorgeous ${displayTemp} in ${location}! Ideal weather to set some inspiring goals and smash them. ✨`,
    `The atmosphere is perfect today. Grab a quick walk to recharge those developer brains! 🌿`,
    `Not too hot, not too cold. Goldilocks would absolutely love the current vibes in ${location}!`,
    `Perfect ambient temperature for some deep creative flow. You've got this! 🚀`
  ];
  return pleasantOptions[Math.floor(Math.random() * pleasantOptions.length)];
}

// 3. API: Weather Commentary API
app.post("/api/gemini/weather-advice", async (req, res) => {
  const { location, temp, condition, humidity, wind, unit } = req.body;

  const client = getGeminiClient();
  const numericTemp = typeof temp === "number" ? temp : parseFloat(temp) || 20;
  const isFahrenheit = unit === "F";
  const displayUnit = isFahrenheit ? "F" : "C";
  const displayWindUnit = isFahrenheit ? "mph" : "km/h";

  if (!client) {
    return res.json({
      commentary: getOfflineWeatherAdvice(location, numericTemp, condition, displayUnit),
    });
  }

  try {
    const prompt = `Location: ${location}
Temperature: ${temp}°${displayUnit}
Condition: ${condition}
Humidity: ${humidity}%
Wind: ${wind} ${displayWindUnit}

Give a funny, warm, and highly engaging one-sentence weather commentary or advice for the user's browser home page. Keep it light, casual, and under 25 words.`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a witty, friendly browser homepage weather reporter.",
        temperature: 0.8,
      },
    });

    res.json({ commentary: response.text?.trim() || getOfflineWeatherAdvice(location, numericTemp, condition, displayUnit) });
  } catch (error: any) {
    console.log("Gemini Weather Advice Rate-limited or Unavailable, using high-quality local generator.");
    res.json({ commentary: getOfflineWeatherAdvice(location, numericTemp, condition, displayUnit) });
  }
});

// Helper and collections for offline quotes
const FALLBACK_QUOTES: Record<string, { quote: string; author: string }[]> = {
  zen: [
    { quote: "Quiet the mind and the soul will speak.", author: "Ma Jaya Sati Bhagavati" },
    { quote: "The present moment is filled with joy and happiness.", author: "Thich Nhat Hanh" },
    { quote: "Breathe in experience, breathe out poetry.", author: "Muriel Rukeyser" },
    { quote: "Mindfulness isn't difficult, we just need to remember to do it.", author: "Sharon Salzberg" },
    { quote: "The feeling that any task is a nuisance will soon disappear if it is done mindfully.", author: "Thich Nhat Hanh" },
    { quote: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", author: "Buddha" },
    { quote: "Nature does not hurry, yet everything is accomplished.", author: "Lao Tzu" }
  ],
  motivation: [
    { quote: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { quote: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
    { quote: "Act as if what you do makes a difference. It does.", author: "William James" },
    { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { quote: "You do not find a happy life. You make it.", author: "Camilla Eyring Kimball" },
    { quote: "Your passion is waiting for your courage to catch up.", author: "Isabelle Lafleche" },
    { quote: "Build your own dreams, or someone else will hire you to build theirs.", author: "Farrah Gray" }
  ],
  coding: [
    { quote: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { quote: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
    { quote: "Make it simple, but significant.", author: "Don Draper" },
    { quote: "Before software can be reusable it first has to be usable.", author: "Ralph Johnson" },
    { quote: "Fix the cause, not the symptom.", author: "Steve Maguire" },
    { quote: "The most disastrous thing that you can ever learn is your first programming language.", author: "Alan Kay" },
    { quote: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Abelson & Sussman" }
  ],
  funny: [
    { quote: "I'm not lazy, I'm just on energy-saving mode.", author: "Anonymous" },
    { quote: "There are 10 types of people in the world: those who understand binary, and those who don't.", author: "Anonymous" },
    { quote: "To err is human, to keyboard is developer.", author: "Anonymous" },
    { quote: "Code is like humor. When you have to explain it, it’s bad.", author: "Cory House" },
    { quote: "If at first you don't succeed, call it version 1.0.", author: "Anonymous" },
    { quote: "A computer once beat me at chess, but it was no match for me at kick boxing.", author: "Emo Philips" }
  ]
};

function getRandomFallbackQuote(category: string): { quote: string; author: string } {
  const list = FALLBACK_QUOTES[category] || FALLBACK_QUOTES.zen;
  return list[Math.floor(Math.random() * list.length)];
}

// 4. API: Zen Quote/Affirmation Generator
app.post("/api/gemini/quote", async (req, res) => {
  const { category } = req.body; // 'zen', 'motivation', 'coding', 'funny'

  const client = getGeminiClient();
  if (!client) {
    const fallback = getRandomFallbackQuote(category);
    return res.json(fallback);
  }

  try {
    const prompt = `Generate an inspiring, deep, or interesting quote for the category: ${category}. Return the quote and the author name separated by ' — '. Keep the quote short, punchy, and beautiful. Do not include quotes symbols.`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a master of wisdom and motivation, crafting beautiful sayings for a minimalist start page.",
        temperature: 0.9,
      },
    });

    const result = response.text?.trim() || "";
    if (result.includes(" — ")) {
      const parts = result.split(" — ");
      res.json({ quote: parts[0]?.trim() || result, author: parts[1]?.trim() || "Philosopher" });
    } else {
      res.json({ quote: result, author: "Philosopher" });
    }
  } catch (error: any) {
    console.error("Gemini Quote API Error:", error);
    const fallback = getRandomFallbackQuote(category);
    res.json(fallback);
  }
});

// 5. API: State Sync (GET & POST) to survive iframe / environment restarts
app.get("/api/sync", async (req, res) => {
  const passcode = req.headers["x-sync-passcode"] as string;
  let userId = "guest";

  if (passcode && passcode.trim().length > 0) {
    userId = passcode.trim();
  }

  try {
    const dataPath = path.join(process.cwd(), "settings_store.json");
    let store: Record<string, Record<string, string>> = {};
    if (fs.existsSync(dataPath)) {
      const content = fs.readFileSync(dataPath, "utf-8");
      if (content.trim()) {
        try {
          store = JSON.parse(content);
        } catch (e) {
          console.error("Failed to parse settings_store.json, resetting:", e);
        }
      }
    }
    res.json(store[userId] || {});
  } catch (error) {
    console.error("Get Sync API Error:", error);
    res.status(500).json({ error: "Failed to load sync data" });
  }
});

app.post("/api/sync", async (req, res) => {
  const { key, value } = req.body;
  const passcode = req.headers["x-sync-passcode"] as string;
  let userId = "guest";

  if (passcode && passcode.trim().length > 0) {
    userId = passcode.trim();
  }

  try {
    const dataPath = path.join(process.cwd(), "settings_store.json");
    let store: Record<string, Record<string, string>> = {};
    if (fs.existsSync(dataPath)) {
      const content = fs.readFileSync(dataPath, "utf-8");
      if (content.trim()) {
        try {
          store = JSON.parse(content);
        } catch (e) {
          console.error("Failed to parse settings_store.json for writing, resetting:", e);
        }
      }
    }

    if (!store[userId]) {
      store[userId] = {};
    }

    store[userId][key] = value;
    fs.writeFileSync(dataPath, JSON.stringify(store, null, 2), "utf-8");
    res.json({ success: true });
  } catch (error) {
    console.error("Post Sync API Error:", error);
    res.status(500).json({ error: "Failed to sync data" });
  }
});

// Serve frontend with Vite integration
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
