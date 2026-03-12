
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { EventData } from '../types';
import { getWarningColorHex } from '../utils';

interface TimelineProps {
  events: EventData[];
  currentEventId: string;
  isSummary: boolean;
  onEventSelect: (event: EventData) => void;
  onSummarySelect: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({ 
  events, 
  currentEventId, 
  isSummary, 
  onEventSelect, 
  onSummarySelect 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-2 flex gap-3 overflow-x-auto custom-scrollbar h-[90px] items-center mb-2 flex-shrink-0 border border-slate-100">
      <button 
        onClick={onSummarySelect}
        className={`flex-shrink-0 flex flex-col items-center justify-center p-2 min-w-[100px] rounded-xl transition-all duration-300 h-full border-0 outline-none
          ${isSummary ? 'bg-purple-100 shadow-md border-2 border-purple-200' : 'bg-transparent hover:bg-slate-50 border-2 border-transparent'}
        `}
      >
        <BarChart3 className={`w-5 h-5 mb-0.5 ${isSummary ? 'text-purple-700' : 'text-slate-400'}`} />
        <div className={`text-sm font-black ${isSummary ? 'text-purple-800' : 'text-slate-600'}`}>数据总览</div>
        <div className={`text-[9px] font-black tracking-widest ${isSummary ? 'text-purple-500' : 'text-slate-400'}`}>年度报表</div>
      </button>

      {events.map(ev => {
        const isActive = currentEventId === ev.id && !isSummary;
        const color = getWarningColorHex(ev.warningType);
        
        return (
          <button 
            key={ev.id}
            onClick={() => onEventSelect(ev)}
            className={`flex-shrink-0 flex flex-col items-center justify-center px-2 py-1 min-w-[110px] rounded-xl transition-all duration-300 h-full outline-none relative group
              ${isActive ? 'bg-gradient-to-b from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 scale-105 z-10' : 'bg-transparent hover:bg-slate-50 border border-transparent hover:border-slate-100'}
            `}
          >
            {/* Active Indicator Line */}
            {isActive && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-blue-400/50 rounded-full blur-[2px]"></div>
            )}

            <div 
              className={`font-oswald font-black tracking-tight transition-all duration-300 ${isActive ? 'text-xl text-white drop-shadow-sm mb-0.5' : 'text-sm text-slate-400 group-hover:text-slate-500'}`}
            >
              {ev.date}
            </div>
            <div 
              className={`font-bold whitespace-nowrap transition-all duration-300 ${isActive ? 'text-sm text-blue-50' : 'text-xs text-slate-300 group-hover:text-slate-400'}`}
            >
              {ev.name}
            </div>
            <div 
              className={`text-[10px] font-black mt-1 uppercase transition-all duration-300 ${isActive ? 'text-yellow-300 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm' : 'text-slate-200 group-hover:text-slate-300'}`}
              style={{ color: isActive ? undefined : color }}
            >
              {ev.warningType.replace('预警', '')}
            </div>
          </button>
        );
      })}
    </div>
  );
};
