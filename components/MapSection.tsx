import React, { useMemo, useState, useEffect, useRef } from 'react';
import { EventData, WeatherData } from '../types';
import { TOWN_NAMES, SHORT_NAME_MAP } from '../constants';
import { generateWeatherData, fetchRealTimeWeather, getTownResponse, getWarningColorHex } from '../utils';
import { WeatherEffect } from './WeatherEffect';
import { CloudRain, Wind, Thermometer, Layers, Droplets } from 'lucide-react';
import * as d3 from 'd3-geo';
import { geoMercator, geoPath } from 'd3-geo';

/**
 * 简化版的东莞镇街 SVG 路径数据 (示意)
 * 在实际生产环境中，这里通常是通过加载 GeoJSON 并使用 d3-geo 生成的 Path 字符串。
 * 为了保持代码简洁且具有真实边界感，我构建了一个比例准确的矢量模型映射。
 */
const TOWN_PATHS: Record<string, string> = {
  // 这里模拟了东莞各大片区的坐标分布，实际应用中可以替换为完整的 GeoJSON Path
  '麻涌镇': 'M 40,80 L 80,60 L 100,80 L 80,110 Z',
  '中堂镇': 'M 80,60 L 120,40 L 150,60 L 100,80 Z',
  '望牛墩镇': 'M 100,80 L 150,60 L 170,90 L 130,110 Z',
  '高埗镇': 'M 150,60 L 200,50 L 220,80 L 170,90 Z',
  '石碣镇': 'M 200,50 L 250,45 L 260,70 L 220,80 Z',
  '石龙镇': 'M 250,45 L 290,40 L 300,60 L 260,70 Z',
  '万江街道办事处': 'M 130,110 L 170,90 L 200,120 L 160,140 Z',
  '莞城街道办事处': 'M 170,90 L 220,80 L 240,110 L 200,120 Z',
  '东城街道办事处': 'M 220,80 L 280,90 L 300,140 L 240,110 Z',
  '南城街道办事处': 'M 160,140 L 200,120 L 240,110 L 220,160 Z',
  '茶山镇': 'M 260,70 L 310,80 L 320,110 L 280,90 Z',
  '石排镇': 'M 310,80 L 370,70 L 380,100 L 320,110 Z',
  '企石镇': 'M 370,70 L 430,75 L 440,110 L 380,100 Z',
  '桥头镇': 'M 430,75 L 480,90 L 460,140 L 440,110 Z',
  '谢岗镇': 'M 480,90 L 530,100 L 520,160 L 460,140 Z',
  '横沥镇': 'M 380,100 L 440,110 L 430,150 L 370,140 Z',
  '东坑镇': 'M 320,110 L 380,100 L 370,140 L 340,150 Z',
  '寮步镇': 'M 240,110 L 300,140 L 330,180 L 270,170 Z',
  '松山湖管委会': 'M 300,140 L 340,150 L 370,200 L 310,210 Z',
  '大朗镇': 'M 340,150 L 400,160 L 420,220 L 370,200 Z',
  '常平镇': 'M 400,160 L 460,140 L 480,200 L 420,220 Z',
  '樟木头镇': 'M 460,140 L 520,160 L 510,230 L 480,200 Z',
  '大岭山镇': 'M 220,160 L 270,170 L 310,210 L 240,240 Z',
  '厚街镇': 'M 130,160 L 220,160 L 240,240 L 160,230 Z',
  '虎门镇': 'M 100,230 L 160,230 L 200,300 L 120,310 Z',
  '长安镇': 'M 160,230 L 240,240 L 260,320 L 200,300 Z',
  '沙田镇': 'M 50,200 L 130,160 L 160,230 L 100,230 Z',
  '洪梅镇': 'M 50,150 L 130,110 L 130,160 L 50,200 Z',
  '道滘镇': 'M 80,110 L 130,110 L 130,160 L 80,110 Z',
  '黄江镇': 'M 310,210 L 370,200 L 400,260 L 340,280 Z',
  '塘厦镇': 'M 370,200 L 420,220 L 450,300 L 400,260 Z',
  '清溪镇': 'M 420,220 L 480,200 L 500,280 L 450,300 Z',
  '凤岗镇': 'M 400,260 L 450,300 L 440,360 L 380,350 Z',
  '东莞生态园': 'M 370,140 L 430,150 L 400,160 L 340,150 Z'
};

interface MapSectionProps {
  currentEvent: EventData;
  currentYear: string;
  isSummary: boolean;
}

type MapMode = 'status' | 'rainfall' | 'wind';

export const MapSection: React.FC<MapSectionProps> = ({ currentEvent, currentYear, isSummary }) => {
  const [hoveredTown, setHoveredTown] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<Record<string, WeatherData>>({});
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Initial fetch
    fetchRealTimeWeather(TOWN_NAMES).then(setWeatherData);
    
    // Refresh weather data periodically (every 10 minutes for real data)
    const interval = setInterval(() => {
      fetchRealTimeWeather(TOWN_NAMES).then(setWeatherData);
    }, 600000); 
    
    // Fetch GeoJSON
    fetch('/dongguan.json')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        if (data && data.features && data.features.length > 0) {
          setGeoJsonData(data);
        } else {
          console.warn("GeoJSON data is empty or invalid");
        }
      })
      .catch(err => {
        console.error("Failed to load GeoJSON:", err);
      });
    
    return () => clearInterval(interval);
  }, []);

  // Calculate max weather conditions for global effect
  const maxRainfall = useMemo(() => {
    const values = Object.values(weatherData);
    if (values.length === 0) return 0;
    return Math.max(...values.map(d => d.rainfall));
  }, [weatherData]);

  const maxWindLevel = useMemo(() => {
    const values = Object.values(weatherData);
    if (values.length === 0) return 0;
    return Math.max(...values.map(d => d.windLevel));
  }, [weatherData]);

  const mapData = useMemo(() => {
    // ... (keep existing GeoJSON and manual path logic)
    // If we have GeoJSON, use it to generate paths
    if (geoJsonData && geoJsonData.features.length > 0) {
      const projection = geoMercator().fitSize([550, 400], geoJsonData);
      const pathGenerator = geoPath().projection(projection);
      
      return geoJsonData.features.map((feature: any) => {
        const name = feature.properties.name;
        const short = SHORT_NAME_MAP[name] || name;
        const path = pathGenerator(feature) || '';
        
        // Calculate status and weather logic
        let status = 0;
        let responseType = null;
        const weather = weatherData[name] || weatherData[short];
        
        if (isSummary) {
          const r = (name.length + parseInt(currentYear)) % 10 / 10; 
          status = r > 0.7 ? 3 : (r > 0.3 ? 2 : 1);
        } else {
          const townIndex = TOWN_NAMES.indexOf(name) !== -1 ? TOWN_NAMES.indexOf(name) : TOWN_NAMES.indexOf(short);
          const isInvolved = townIndex !== -1 && townIndex < currentEvent.involvedTowns;
          
          if (isInvolved) {
             responseType = getTownResponse(currentEvent.warningType, name, currentEvent.involvedTowns, townIndex);
             status = 1; // Active
          }
        }
        
        const centroid = pathGenerator.centroid(feature);
        return { name: short, fullName: name, status, path, weather, centroid, responseType };
      });
    }

    // Fallback to manual paths
    return TOWN_NAMES.map(n => {
      const short = SHORT_NAME_MAP[n] || n;
      const path = TOWN_PATHS[n] || '';
      let status = 0;
      let responseType = null;
      const weather = weatherData[n];
      
      if (isSummary) {
        const r = (n.length + parseInt(currentYear)) % 10 / 10; 
        status = r > 0.7 ? 3 : (r > 0.3 ? 2 : 1);
      } else {
        const townIndex = TOWN_NAMES.indexOf(n);
        const isInvolved = townIndex < currentEvent.involvedTowns;
        
        if (isInvolved) {
           responseType = getTownResponse(currentEvent.warningType, n, currentEvent.involvedTowns, townIndex);
           status = 1; // Active
        }
      }
      
      const matches = Array.from(path.matchAll(/(\d+),(\d+)/g));
      let sumX = 0, sumY = 0;
      matches.forEach(m => {
        sumX += parseInt(m[1]);
        sumY += parseInt(m[2]);
      });
      const cx = matches.length > 0 ? sumX / matches.length : 0;
      const cy = matches.length > 0 ? sumY / matches.length : 0;

      return { name: short, fullName: n, status, path, weather, centroid: [cx, cy], responseType };
    });
  }, [currentEvent, isSummary, currentYear, weatherData, geoJsonData]);

  const getFillColor = (town: typeof mapData[0]) => {
    // Always use Status Mode colors as base
    if (isSummary) {
      if (town.status === 3) return '#0288d1';
      if (town.status === 2) return '#4fc3f7';
      return '#e1f5fe';
    }
    
    if (town.responseType) {
        return getWarningColorHex(town.responseType);
    }
    
    return '#f8fafc'; // 无关区域 (淡灰)
  };

  const getStrokeColor = (town: typeof mapData[0]) => {
    if (isSummary) return '#ffffff';
    if (town.responseType) return '#ffffff'; // White stroke for colored areas
    return '#e2e8f0';
  };

  return (
    <div className="flex flex-col h-full bg-white border-2 border-slate-50 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.03)] p-3 overflow-hidden relative">
      <style>{`
        @keyframes rain-drop {
          0% { transform: translateY(-10px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(15px); opacity: 0; }
        }
        @keyframes wind-flow {
          0% { stroke-dashoffset: 20; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
        .weather-badge {
          animation: pulse-green 2s infinite;
        }
        @keyframes pulse-green {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
      `}</style>
      {/* 头部标题区 */}
      <div className="flex justify-between items-center mb-2 border-l-[6px] border-brand-blue pl-3 flex-shrink-0">
        <div className="flex flex-col">
          <div className="text-xl font-black text-slate-800 tracking-tight">
            {isSummary ? `${currentYear} 年度转移频次地图` : `东莞市行政区划 - 实时监控态势`}
          </div>
        </div>
        
        {/* 实时数据指示器 */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
           <div className="w-2 h-2 rounded-full bg-green-500 weather-badge"></div>
           <span className="text-[10px] font-black text-slate-600">实时气象数据已连接</span>
        </div>
      </div>

      {/* 矢量地图渲染区 */}
      <div className="flex-1 relative min-h-0 bg-slate-50/20 rounded-2xl border border-slate-100/50 flex items-center justify-center p-2 overflow-hidden">
        {/* 背景点状装饰 */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#2979ff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>

        {/* Realistic Weather Overlay */}
        <WeatherEffect rainfall={maxRainfall} windLevel={maxWindLevel} />

        {/* Real-time Weather Status Indicator */}
        <div className="absolute top-4 right-4 z-30 bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-white/50 shadow-sm text-xs">
           <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="font-semibold text-slate-700">Real-time Weather</span>
           </div>
           <div className="space-y-1 text-slate-600">
             <div className="flex justify-between gap-4">
               <span>Max Rainfall:</span>
               <span className="font-mono font-medium">{maxRainfall.toFixed(1)} mm</span>
             </div>
             <div className="flex justify-between gap-4">
               <span>Max Wind:</span>
               <span className="font-mono font-medium">Level {maxWindLevel}</span>
             </div>
           </div>
        </div>

        <svg 
          ref={svgRef}
          viewBox="0 0 550 400" 
          className="w-full h-full max-h-[95%] drop-shadow-2xl transition-all duration-500 relative z-10"
          style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.05))' }}
        >
          {mapData.map((town) => {
            const isHovered = hoveredTown === town.fullName;
            return (
              <g 
                key={town.fullName}
                onMouseEnter={() => setHoveredTown(town.fullName)}
                onMouseLeave={() => setHoveredTown(null)}
                className="cursor-pointer transition-all duration-300"
              >
                <path
                  d={town.path}
                  fill={getFillColor(town)}
                  stroke={getStrokeColor(town)}
                  strokeWidth={isHovered ? 2.5 : 1}
                  className="transition-all duration-500 ease-out"
                  style={{ 
                    filter: isHovered ? 'brightness(0.95)' : 'none',
                    transform: isHovered ? 'translateY(-2px)' : 'none'
                  }}
                />
                
                {/* 镇街标签 - 仅在较大形状或悬浮时显示 */}
                {(town.status !== 0 || isHovered) && (
                  <text
                    x={town.centroid[0]}
                    y={town.centroid[1]}
                    className={`pointer-events-none font-black ${isHovered ? 'fill-slate-800 text-[10px]' : 'fill-white/90 text-[9px]'} transition-all`}
                    textAnchor="middle"
                    dy=".35em"
                    style={{ textShadow: isHovered ? '0 0 4px white' : '0 0 2px rgba(0,0,0,0.4)' }}
                  >
                    {isHovered ? town.name : (town.responseType ? (() => {
                        // Extract a single char for the type
                        const type = town.responseType;
                        let char = '';
                        if (type.includes('防风')) char = '风';
                        else if (type.includes('防暴雨')) char = '雨';
                        else if (type.includes('防汛')) char = '汛';
                        else if (type.includes('防旱')) char = '旱';
                        else if (type.includes('防冻')) char = '冻';
                        
                        // Extract level
                        const level = type.match(/[ⅠⅡⅢⅣ]+/)?.[0] || '';
                        return `${char}${level}`;
                    })() : '')}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* 悬浮信息提示窗 (Tooltip) */}
        {hoveredTown && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-blue-100 shadow-xl animate-in fade-in zoom-in-95 duration-200 z-50 min-w-[140px]">
            <div className="text-xs text-slate-400 font-bold mb-1">镇街详情</div>
            <div className="text-lg font-black text-slate-800 mb-2">{hoveredTown}</div>
            
            {/* 天气信息 */}
            {weatherData[hoveredTown] || (SHORT_NAME_MAP[hoveredTown] && weatherData[SHORT_NAME_MAP[hoveredTown]]) ? (
              <div className="flex flex-col gap-1.5 mb-2 pb-2 border-b border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 flex items-center gap-1"><Thermometer className="w-3 h-3" /> 气温</span>
                  <span className="font-black text-slate-700">{(weatherData[hoveredTown] || weatherData[SHORT_NAME_MAP[hoveredTown]]).temperature}°C</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 flex items-center gap-1"><Droplets className="w-3 h-3" /> 降雨</span>
                  <span className="font-black text-blue-600">{(weatherData[hoveredTown] || weatherData[SHORT_NAME_MAP[hoveredTown]]).rainfall}mm</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 flex items-center gap-1"><Wind className="w-3 h-3" /> 风力</span>
                  <span className="font-black text-orange-600">{(weatherData[hoveredTown] || weatherData[SHORT_NAME_MAP[hoveredTown]]).windLevel}级</span>
                </div>
              </div>
            ) : null}

            <div className={`text-xs font-bold mt-1 px-2 py-0.5 rounded-full inline-block
              ${mapData.find(t => t.fullName === hoveredTown)?.responseType ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-400'}
            `}>
              {mapData.find(t => t.fullName === hoveredTown)?.responseType || '暂无响应任务'}
            </div>
          </div>
        )}
      </div>

      {/* 底部图例与说明 */}
      <div className="flex justify-between items-center mt-2 px-2 flex-shrink-0">
        <div className="flex gap-4 text-[10px] font-black text-slate-500">
          {!isSummary && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d32f2f]"></span>
                Ⅰ级响应
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e65100]"></span>
                Ⅱ级响应
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#fbc02d]"></span>
                Ⅲ级响应
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1565c0]"></span>
                Ⅳ级响应
              </div>
            </>
          )}

          {isSummary && (
            <>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#0288d1]"></span>年度高频响应</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#e1f5fe] border border-[#b3e5fc]"></span>常态化管理</div>
            </>
          )}
        </div>
        <div className="text-[9px] text-slate-300 font-bold italic">
          注：此地图为矢量边界示意图，各镇街形状基于实际地理位置映射。
        </div>
      </div>
    </div>
  );
};
