import React from 'react';
import { motion } from 'motion/react';

interface WeatherIconProps {
  condition: string; // 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'thunderstorm' | 'windy'
  className?: string;
}

export default function WeatherIcon({ condition, className = "w-16 h-16" }: WeatherIconProps) {
  const normalized = condition.toLowerCase();

  if (normalized.includes('sunny') || normalized.includes('clear')) {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Animated Glowing Sun Rays */}
        <motion.circle
          cx="50"
          cy="50"
          r="24"
          stroke="url(#sunGlow)"
          strokeWidth="6"
          strokeDasharray="4 6"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        />
        {/* Main Sun Body */}
        <motion.circle
          cx="50"
          cy="50"
          r="16"
          fill="url(#sunGrad)"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />
        <defs>
          <radialGradient id="sunGlow" cx="50" cy="50" r="27" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sunGrad" x1="34" y1="34" x2="66" y2="66" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (normalized.includes('rain') || normalized.includes('shower') || normalized.includes('drizzle')) {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Cloud Body */}
        <path d="M26 62C20.4772 62 16 57.5228 16 52C16 46.9068 19.803 42.6999 24.8144 42.0722C25.9926 31.7891 34.6983 24 45.3333 24C53.7937 24 61.0264 29.0792 63.9557 36.4338C65.3404 35.5056 67.0094 35 68.8 35C73.881 35 78 39.119 78 44.2C78 44.5772 77.9774 44.9491 77.9333 45.3137C82.4925 46.5413 86 50.6277 86 55.5C86 61.299 81.299 66 75.5 66H26V62Z" fill="url(#rainCloudGrad)" />
        {/* Falling Rain Drops */}
        <g stroke="#38BDF8" strokeWidth="3" strokeLinecap="round">
          <motion.line
            x1="35" y1="70" x2="31" y2="82"
            animate={{ y: [0, 15, 0], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0 }}
          />
          <motion.line
            x1="50" y1="72" x2="46" y2="84"
            animate={{ y: [0, 15, 0], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.4 }}
          />
          <motion.line
            x1="65" y1="70" x2="61" y2="82"
            animate={{ y: [0, 15, 0], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.8 }}
          />
        </g>
        <defs>
          <linearGradient id="rainCloudGrad" x1="16" y1="24" x2="86" y2="66" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (normalized.includes('thunder') || normalized.includes('storm') || normalized.includes('lightning')) {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Dark Cloud */}
        <path d="M26 62C20.4772 62 16 57.5228 16 52C16 46.9068 19.803 42.6999 24.8144 42.0722C25.9926 31.7891 34.6983 24 45.3333 24C53.7937 24 61.0264 29.0792 63.9557 36.4338C65.3404 35.5056 67.0094 35 68.8 35C73.881 35 78 39.119 78 44.2C78 44.5772 77.9774 44.9491 77.9333 45.3137C82.4925 46.5413 86 50.6277 86 55.5C86 61.299 81.299 66 75.5 66H26V62Z" fill="url(#stormCloudGrad)" />
        {/* Flash Lightning Bolt */}
        <motion.path
          d="M48 62 L40 76 H52 L44 92 L60 72 H48 L54 62"
          fill="#FBBF24"
          stroke="#F59E0B"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ opacity: [0.1, 1, 0.1, 1, 0.1, 0.1, 0.8, 0.1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        />
        <defs>
          <linearGradient id="stormCloudGrad" x1="16" y1="24" x2="86" y2="66" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (normalized.includes('snow') || normalized.includes('ice') || normalized.includes('flurry') || normalized.includes('sleet')) {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft Cloud */}
        <path d="M26 62C20.4772 62 16 57.5228 16 52C16 46.9068 19.803 42.6999 24.8144 42.0722C25.9926 31.7891 34.6983 24 45.3333 24C53.7937 24 61.0264 29.0792 63.9557 36.4338C65.3404 35.5056 67.0094 35 68.8 35C73.881 35 78 39.119 78 44.2C78 44.5772 77.9774 44.9491 77.9333 45.3137C82.4925 46.5413 86 50.6277 86 55.5C86 61.299 81.299 66 75.5 66H26V62Z" fill="url(#snowCloudGrad)" />
        {/* Rotating, Falling Snowflakes */}
        <g fill="#E2E8F0">
          <motion.circle
            cx="35" cy="74" r="3"
            animate={{ y: [0, 15, 0], opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0 }}
          />
          <motion.circle
            cx="50" cy="77" r="4"
            animate={{ y: [0, 15, 0], opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.6 }}
          />
          <motion.circle
            cx="65" cy="74" r="3"
            animate={{ y: [0, 15, 0], opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 1.2 }}
          />
        </g>
        <defs>
          <linearGradient id="snowCloudGrad" x1="16" y1="24" x2="86" y2="66" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (normalized.includes('wind') || normalized.includes('breeze') || normalized.includes('gale')) {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Animated Wind Lines */}
        <g stroke="#94A3B8" strokeWidth="4" strokeLinecap="round">
          <motion.path
            d="M20 35 H65 C70 35 73 32 73 28 C73 24 70 22 66 22 C62 22 60 25 60 28"
            animate={{ x: [-15, 10, -15] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          />
          <motion.path
            d="M15 50 H75 C80 50 83 47 83 43 C83 39 80 37 76 37 C72 37 70 40 70 43"
            animate={{ x: [-10, 15, -10] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
          />
          <motion.path
            d="M25 65 H55 C60 65 63 62 63 58 C63 54 60 52 56 52 C52 52 50 55 50 58"
            animate={{ x: [-20, 5, -20] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.2 }}
          />
        </g>
      </svg>
    );
  }

  // DEFAULT: Cloudy / Partly Cloudy
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sun peaking behind cloud */}
      <motion.circle
        cx="60"
        cy="35"
        r="14"
        fill="url(#partlySun)"
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      />
      {/* Main Cloud */}
      <motion.path
        d="M26 62C20.4772 62 16 57.5228 16 52C16 46.9068 19.803 42.6999 24.8144 42.0722C25.9926 31.7891 34.6983 24 45.3333 24C53.7937 24 61.0264 29.0792 63.9557 36.4338C65.3404 35.5056 67.0094 35 68.8 35C73.881 35 78 39.119 78 44.2C78 44.5772 77.9774 44.9491 77.9333 45.3137C82.4925 46.5413 86 50.6277 86 55.5C86 61.299 81.299 66 75.5 66H26V62Z"
        fill="url(#cloudGrad)"
        animate={{ y: [0, -2, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      />
      <defs>
        <linearGradient id="partlySun" x1="46" y1="21" x2="74" y2="49" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="cloudGrad" x1="16" y1="24" x2="86" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
