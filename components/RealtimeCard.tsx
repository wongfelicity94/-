import React, { useMemo } from 'react';
import { EventData } from '../types';

interface RealtimeCardProps {
  event: EventData;
}

export const RealtimeCard: React.FC<RealtimeCardProps> = ({ event }) => {
  const stats = useMemo(() => {
    const doneTowns = Math.floor(event.involvedTowns * event.progress / 100);
    const doneSites = Math.floor(event.sites * event.progress / 100);
    const donePeople = Math.floor(event.people * event.progress / 100);
    return { doneTowns, doneSites, donePeople };
  }, [event]);

  return (
    <div className="bg-white rounded-2xl p-3 flex flex-col shadow-[0_15px_50px_rgba(0,0,0,0.06)] border-2 border-blue-100 h-full relative overflow-hidden group">
      {/* 动态背景光效 */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/40 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-2 z-10 flex-shrink-0">
        <div className="text-lg font-black text-slate-800 border-l-[6px] border-safe pl-3 flex items-center gap-2">
          实时进度监测
          <span className="flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-safe opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-safe"></span>
          </span>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black shadow-lg shadow-blue-200 tracking-tighter">
          实时监控
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-2 z-10 min-h-0 overflow-hidden px-1">
        <ProgressRow 
          label="镇街确认率" 
          current={stats.doneTowns} 
          total={event.involvedTowns} 
          color="text-safe"
          bgColor="bg-safe"
        />
        <ProgressRow 
          label="工地确认率" 
          current={stats.doneSites} 
          total={event.sites} 
          color="text-brand-blue"
          bgColor="bg-brand-blue"
        />
        <ProgressRow 
          label="工地人员确认率" 
          current={stats.donePeople} 
          total={event.people} 
          color="text-warn-orange"
          bgColor="bg-warn-orange"
        />
      </div>
    </div>
  );
};

const ProgressRow = ({ label, current, total, color, bgColor }: { label: string, current: number, total: number, color: string, bgColor: string }) => {
  const percent = total > 0 ? (current / total) * 100 : 0;
  
  return (
    <div className="flex flex-col py-1">
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm text-slate-600 font-bold tracking-tight">{label}</span>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-black font-oswald leading-none tracking-tighter ${color} drop-shadow-sm`}>{percent.toFixed(0)}%</span>
          <div className="flex items-center bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-bold font-oswald whitespace-nowrap border border-slate-200">
            <span className="text-slate-700 font-black text-xs mr-1">{current.toLocaleString()}</span> / {total.toLocaleString()}
          </div>
        </div>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
        <div 
          className={`h-full rounded-full transition-all duration-1500 ease-out ${bgColor} relative shadow-[0_0_8px_rgba(0,0,0,0.1)]`} 
          style={{ width: `${percent}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite] pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};