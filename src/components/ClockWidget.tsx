import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckSquare } from 'lucide-react';

export default function ClockWidget() {
  const [time, setTime] = useState(new Date());
  const [format24h, setFormat24h] = useState(() => {
    return localStorage.getItem('clock_24h') === 'true';
  });
  const [showSeconds, setShowSeconds] = useState(() => {
    return localStorage.getItem('clock_seconds') !== 'false';
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleFormat = () => {
    const newVal = !format24h;
    setFormat24h(newVal);
    localStorage.setItem('clock_24h', String(newVal));
  };

  const handleToggleSeconds = () => {
    const newVal = !showSeconds;
    setShowSeconds(newVal);
    localStorage.setItem('clock_seconds', String(newVal));
  };

  // Format Time
  const hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  
  let timeString = '';
  let ampm = '';

  if (format24h) {
    timeString = `${hours.toString().padStart(2, '0')}:${minutes}${showSeconds ? `:${seconds}` : ''}`;
  } else {
    const displayHours = hours % 12 || 12;
    ampm = hours >= 12 ? 'PM' : 'AM';
    timeString = `${displayHours.toString().padStart(2, '0')}:${minutes}${showSeconds ? `:${seconds}` : ''}`;
  }

  // Format Date
  const dateOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const dateString = time.toLocaleDateString(undefined, dateOptions);

  // Greeting based on time
  let greeting = 'Hello';
  if (hours >= 5 && hours < 12) {
    greeting = 'Good morning';
  } else if (hours >= 12 && hours < 17) {
    greeting = 'Good afternoon';
  } else if (hours >= 17 && hours < 22) {
    greeting = 'Good evening';
  } else {
    greeting = 'Good night';
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-white select-none">
      {/* Time Display */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-5xl font-bold tracking-tight font-sans text-white drop-shadow-md">
          {timeString}
        </span>
        {!format24h && (
          <span className="text-sm font-semibold tracking-wider text-white/70 uppercase">
            {ampm}
          </span>
        )}
      </div>

      {/* Date Display */}
      <div className="flex items-center gap-1.5 mt-2.5 text-white/80 text-xs tracking-wide">
        <Calendar className="w-3.5 h-3.5" />
        <span>{dateString}</span>
      </div>

      {/* Personalized Greeting */}
      <h2 className="mt-4 text-base font-medium text-white/90 font-sans tracking-wide">
        {greeting}, Joey!
      </h2>

      {/* Mini Controls */}
      <div className="flex items-center gap-3 mt-4 text-[10px] text-white/50">
        <button 
          onClick={handleToggleFormat}
          className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 hover:text-white transition-colors"
        >
          {format24h ? '12-Hour Mode' : '24-Hour Mode'}
        </button>
        <button 
          onClick={handleToggleSeconds}
          className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 hover:text-white transition-colors"
        >
          {showSeconds ? 'Hide Seconds' : 'Show Seconds'}
        </button>
      </div>
    </div>
  );
}
