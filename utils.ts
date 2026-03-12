import { EventData } from './types';
import { WARNING_TYPES } from './constants';

export const generateEvents = (year: string): EventData[] => {
  const arr: EventData[] = [];
  for(let i=1; i<=30; i++){
      const m = Math.floor((i/30)*12)+1;
      const mm = m<10?'0'+m:m;
      const done = i<=25;
      const typeIndex = i % 11;
      const baseDate = `${year}-${mm}-15`;
      arr.push({
          id: year+'-'+i, 
          date: `${year}-${mm}-15`, 
          fullDate: `${baseDate}`, 
          name: `第${i}号响应`,
          warningType: WARNING_TYPES[typeIndex],
          involvedTowns: Math.floor(Math.random()*20)+10,
          sites: 100+i*15, 
          people: 1000+i*300,
          progress: done ? 100 : (i===26 ? 65 : 10),
          msg: `根据${WARNING_TYPES[typeIndex]}要求，请各镇街立即启动应急响应，转移危险区域人员。`,
          duration: done ? `${Math.floor(Math.random()*5)+3}小时` : '-',
          timeline: { 
            start: `${baseDate} 08:00`, 
            p50: `${baseDate} 10:30`, 
            p80: `${baseDate} 12:45`, 
            p100: done ? `${baseDate} 15:00` : '' 
          }
      })
  }
  return arr;
};

export const getWarningStyles = (type: string) => {
    if(type.includes('Ⅰ级')) return {
        bg: 'bg-gradient-to-br from-red-700 to-red-500',
        shadow: 'shadow-red-700/30',
        text: 'text-white'
    };
    if(type.includes('Ⅱ级')) return {
        bg: 'bg-gradient-to-br from-orange-700 to-orange-500',
        shadow: 'shadow-orange-700/30',
        text: 'text-white'
    };
    if(type.includes('Ⅲ级')) return {
        bg: 'bg-gradient-to-br from-yellow-500 to-yellow-300',
        shadow: 'shadow-yellow-500/30',
        text: 'text-slate-800'
    };
    return {
        bg: 'bg-gradient-to-br from-blue-700 to-blue-400',
        shadow: 'shadow-blue-700/30',
        text: 'text-white'
    };
};

export const getWarningColorHex = (type: string) => {
    if(type.includes('Ⅰ级')) return '#d32f2f';
    if(type.includes('Ⅱ级')) return '#e65100';
    if(type.includes('Ⅲ级')) return '#fbc02d';
    return '#1565c0';
};

export const getTownResponse = (eventName: string, townName: string, involvedTowns: number, index: number) => {
    // Simulate town specific response based on the main event
    // If town is not involved (index >= involvedTowns), return null
    if (index >= involvedTowns) return null;

    // Extract base type
    let baseType = eventName.substring(0, 2);
    if (eventName.startsWith('防暴雨')) {
        baseType = '防暴雨';
    }

    const levels = ['Ⅳ级', 'Ⅲ级', 'Ⅱ级', 'Ⅰ级'];
    
    // Determine related types for mixing
    let possibleTypes = [baseType];
    if (baseType === '防风') possibleTypes = ['防风', '防暴雨', '防汛'];
    else if (baseType === '防暴雨') possibleTypes = ['防暴雨', '防汛', '防风'];
    else if (baseType === '防汛') possibleTypes = ['防汛', '防暴雨'];
    
    // Hash for deterministic randomness
    const hash = (townName.length + eventName.length + index) % 100;
    
    // Select type
    // 70% chance to keep main type, 30% to pick others
    let selectedType = baseType;
    if (possibleTypes.length > 1 && hash > 70) {
        const typeIndex = hash % possibleTypes.length;
        selectedType = possibleTypes[typeIndex];
    }

    // Determine Level
    let levelIndex = 0;
    if (eventName.includes('Ⅰ级')) levelIndex = 3;
    else if (eventName.includes('Ⅱ级')) levelIndex = 2;
    else if (eventName.includes('Ⅲ级')) levelIndex = 1;
    else levelIndex = 0;

    // Vary the level slightly
    // 60% same level, 30% one level lower, 10% one level higher (if possible)
    let localLevelIndex = levelIndex;
    const levelHash = (hash * 13) % 100;
    
    if (levelHash < 30 && levelIndex > 0) {
        localLevelIndex = levelIndex - 1;
    } else if (levelHash > 90 && levelIndex < 3) {
        localLevelIndex = levelIndex + 1;
    }

    return `${selectedType}${levels[localLevelIndex]}应急响应`;
};

import { TOWN_COORDINATES } from './constants';

export const fetchRealTimeWeather = async (towns: string[]): Promise<Record<string, import('./types').WeatherData>> => {
  const data: Record<string, import('./types').WeatherData> = {};
  
  // Open-Meteo supports bulk requests by comma-separating lat/lons
  // However, for simplicity and reliability in this demo, we might fetch them in batches or construct a single large URL.
  // Let's try to construct a single URL for all towns to minimize requests.
  
  const lats: number[] = [];
  const lons: number[] = [];
  const townKeys: string[] = [];

  towns.forEach(town => {
    const coords = TOWN_COORDINATES[town];
    if (coords) {
      lats.push(coords.lat);
      lons.push(coords.lon);
      townKeys.push(town);
    }
  });

  if (lats.length === 0) return generateWeatherData(towns); // Fallback

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats.join(',')}&longitude=${lons.join(',')}&current=temperature_2m,rain,wind_speed_10m&timezone=Asia%2FShanghai`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather API failed');
    const json = await response.json();

    // Open-Meteo returns an array of results if multiple coords are passed, 
    // OR a single object if only one.
    // However, the "bulk" format usually returns arrays within the 'current' object if multiple points?
    // Actually, Open-Meteo bulk request returns an ARRAY of response objects.
    
    const results = Array.isArray(json) ? json : [json];

    results.forEach((res: any, index: number) => {
      const townName = townKeys[index];
      const current = res.current;
      
      // Map Wind Speed (km/h) to Beaufort Scale (approx)
      // < 1 km/h = 0
      // 1-5 = 1
      // 6-11 = 2
      // 12-19 = 3
      // 20-28 = 4
      // 29-38 = 5
      // 39-49 = 6
      // 50-61 = 7
      // 62-74 = 8
      const ws = current.wind_speed_10m;
      let windLevel = 0;
      if (ws < 1) windLevel = 0;
      else if (ws <= 5) windLevel = 1;
      else if (ws <= 11) windLevel = 2;
      else if (ws <= 19) windLevel = 3;
      else if (ws <= 28) windLevel = 4;
      else if (ws <= 38) windLevel = 5;
      else if (ws <= 49) windLevel = 6;
      else if (ws <= 61) windLevel = 7;
      else windLevel = 8; // simplified max

      data[townName] = {
        townName: townName,
        temperature: current.temperature_2m,
        rainfall: current.rain, // mm
        windLevel: windLevel,
        weatherType: current.rain > 0 ? (current.rain > 5 ? 'HeavyRain' : 'Rain') : 'Cloudy'
      };
    });
    
    return data;

  } catch (error) {
    console.error("Failed to fetch real weather, using mock:", error);
    return generateWeatherData(towns);
  }
};

export const generateWeatherData = (towns: string[]): Record<string, import('./types').WeatherData> => {
  const weatherTypes = ['Sunny', 'Cloudy', 'Rain', 'HeavyRain', 'Storm'] as const;
  const data: Record<string, import('./types').WeatherData> = {};
  
  towns.forEach(town => {
    // Simulate some regional consistency or randomness
    const rand = Math.random();
    let type: typeof weatherTypes[number] = 'Cloudy';
    let rainfall = 0;
    
    if (rand > 0.8) {
      type = 'Storm';
      rainfall = 50 + Math.random() * 100;
    } else if (rand > 0.6) {
      type = 'HeavyRain';
      rainfall = 25 + Math.random() * 25;
    } else if (rand > 0.3) {
      type = 'Rain';
      rainfall = 5 + Math.random() * 20;
    } else {
      type = 'Cloudy';
      rainfall = Math.random() * 5;
    }

    data[town] = {
      townName: town,
      temperature: 24 + Math.floor(Math.random() * 5),
      rainfall: parseFloat(rainfall.toFixed(1)),
      windLevel: 3 + Math.floor(Math.random() * 5),
      weatherType: type
    };
  });
  
  return data;
};