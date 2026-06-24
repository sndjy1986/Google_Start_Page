import React, { useState, useEffect } from 'react';
import { Search, MapPin, Wind, Droplets, RefreshCw, MessageSquare } from 'lucide-react';
import WeatherIcon from './WeatherIcon';

interface WeatherData {
  temp: number;
  condition: string;
  conditionCode: number;
  humidity: number;
  windSpeed: number;
}

export default function WeatherWidget() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationName, setLocationName] = useState(() => {
    return localStorage.getItem('weather_location_name') || 'San Francisco, USA';
  });
  const [lat, setLat] = useState(() => {
    return parseFloat(localStorage.getItem('weather_lat') || '37.7749');
  });
  const [lon, setLon] = useState(() => {
    return parseFloat(localStorage.getItem('weather_lon') || '-122.4194');
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [aiCommentary, setAiCommentary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Map WMO Weather Codes to text condition & animation type
  const mapWeatherCode = (code: number): { text: string; category: string } => {
    if (code === 0) return { text: 'Clear Sky', category: 'sunny' };
    if (code >= 1 && code <= 3) return { text: 'Partly Cloudy', category: 'cloudy' };
    if (code === 45 || code === 48) return { text: 'Foggy', category: 'cloudy' };
    if (code >= 51 && code <= 55) return { text: 'Light Drizzle', category: 'rainy' };
    if (code >= 61 && code <= 65) return { text: 'Rainy', category: 'rainy' };
    if (code >= 71 && code <= 77) return { text: 'Snowy', category: 'snowy' };
    if (code >= 80 && code <= 82) return { text: 'Showers', category: 'rainy' };
    if (code >= 85 && code <= 86) return { text: 'Snow Showers', category: 'snowy' };
    if (code >= 95 && code <= 99) return { text: 'Thunderstorm', category: 'thunderstorm' };
    return { text: 'Breezy', category: 'windy' };
  };

  // Fetch Weather Data
  const fetchWeather = async (latitude: number, longitude: number, name: string) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`
      );
      if (!res.ok) throw new Error('Failed to fetch weather forecast.');

      const data = await res.json();
      const current = data.current;
      const mapping = mapWeatherCode(current.weather_code);

      const parsedWeather: WeatherData = {
        temp: Math.round(current.temperature_2m),
        condition: mapping.text,
        conditionCode: current.weather_code,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
      };

      setWeather(parsedWeather);
      fetchAiCommentary(name, parsedWeather);
    } catch (err: any) {
      console.warn(err);
      setErrorMsg('Could not fetch weather forecast.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch AI commentary from backend
  const fetchAiCommentary = async (locName: string, wData: WeatherData) => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/gemini/weather-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: locName,
          temp: wData.temp,
          condition: wData.condition,
          humidity: wData.humidity,
          wind: wData.windSpeed,
          unit: 'F',
        }),
      });
      const data = await res.json();
      setAiCommentary(data.commentary);
    } catch (err) {
      console.warn(err);
      setAiCommentary(`Stay awesome! It's a fine ${wData.condition.toLowerCase()} day in ${locName}.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Trigger weather load on coordinates update
  useEffect(() => {
    fetchWeather(lat, lon, locationName);
  }, [lat, lon]);

  // Handle Search submit
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1&language=en&format=json`
      );
      if (!geoRes.ok) throw new Error('Geocoding service error.');

      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) {
        setErrorMsg('City not found. Try another city.');
        setIsLoading(false);
        return;
      }

      const result = geoData.results[0];
      const newName = `${result.name}, ${result.country_code?.toUpperCase() || ''}`;
      const newLat = result.latitude;
      const newLon = result.longitude;

      setLocationName(newName);
      setLat(newLat);
      setLon(newLon);

      localStorage.setItem('weather_location_name', newName);
      localStorage.setItem('weather_lat', String(newLat));
      localStorage.setItem('weather_lon', String(newLon));
      setSearchQuery('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Geocoding service failed.');
      setIsLoading(false);
    }
  };

  // Detect location automatically
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coordsLat = pos.coords.latitude;
        const coordsLon = pos.coords.longitude;
        
        // Reverse search or set name as Current Coords
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordsLat}&lon=${coordsLon}`);
          let reverseName = 'My Location';
          if (res.ok) {
            const data = await res.json();
            reverseName = data.address.city || data.address.town || data.address.village || 'Detected Location';
            if (data.address.country_code) {
              reverseName += `, ${data.address.country_code.toUpperCase()}`;
            }
          }
          setLocationName(reverseName);
          setLat(coordsLat);
          setLon(coordsLon);
          localStorage.setItem('weather_location_name', reverseName);
          localStorage.setItem('weather_lat', String(coordsLat));
          localStorage.setItem('weather_lon', String(coordsLon));
        } catch {
          setLocationName('Detected Location');
          setLat(coordsLat);
          setLon(coordsLon);
        }
      },
      (err) => {
        console.error(err);
        setErrorMsg('Permission denied or location lookup failed.');
        setIsLoading(false);
      }
    );
  };

  const weatherIconCategory = weather ? mapWeatherCode(weather.conditionCode).category : 'cloudy';

  return (
    <div className="flex flex-col h-full text-white font-sans">
      {/* Search Bar for Weather Location */}
      <form onSubmit={handleSearch} className="flex gap-1.5 mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city..."
            className="w-full px-3 py-1.5 pl-8 text-xs bg-white/10 dark:bg-black/20 text-white rounded-lg border border-white/20 focus:outline-none focus:border-white/50 placeholder-white/50"
          />
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-white/50" />
        </div>
        <button
          type="button"
          onClick={handleDetectLocation}
          title="Detect my location"
          className="p-1.5 bg-white/10 dark:bg-black/20 border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
        >
          <MapPin className="w-3.5 h-3.5 text-white/80" />
        </button>
      </form>

      {errorMsg && (
        <span className="text-[10px] text-red-400 font-medium mb-2 block">{errorMsg}</span>
      )}

      {/* Weather Info */}
      {isLoading && !weather ? (
        <div className="flex-1 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-white/60" />
          <span className="text-xs text-white/60">Fetching weather...</span>
        </div>
      ) : weather ? (
        <div className="flex-1 flex flex-col justify-between gap-3">
          {/* Main Info Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white truncate max-w-[140px]" title={locationName}>
                {locationName}
              </h3>
              <p className="text-[10px] text-white/60">{weather.condition}</p>
            </div>
            <div className="flex items-center gap-1">
              <WeatherIcon condition={weatherIconCategory} className="w-12 h-12" />
              <span className="text-3xl font-bold tracking-tight">{weather.temp}°F</span>
            </div>
          </div>

          {/* Details Bar */}
          <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-white/5 dark:bg-black/15 border border-white/10 text-[10px]">
            <div className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <div>
                <span className="text-white/50 block">Humidity</span>
                <span className="font-semibold">{weather.humidity}%</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <div>
                <span className="text-white/50 block">Wind</span>
                <span className="font-semibold">{weather.windSpeed} mph</span>
              </div>
            </div>
          </div>

          {/* Gemini commentary box */}
          <div className="p-2.5 rounded-xl bg-white/10 dark:bg-white/5 border border-white/15 text-[10px] leading-normal italic text-white/90 shadow-sm relative">
            <div className="flex items-center gap-1 mb-1 font-semibold not-italic text-amber-300">
              <MessageSquare className="w-3 h-3" />
              <span>Gemini Weather Quote</span>
              {isAiLoading && <RefreshCw className="w-2.5 h-2.5 animate-spin ml-auto" />}
            </div>
            <p className="line-clamp-3">
              {aiCommentary || "Generating witty commentary..."}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
