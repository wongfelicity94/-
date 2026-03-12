import React from 'react';
import { EventData } from '../types';

interface TraceCardProps {
  event: EventData;
}

export const TraceCard: React.FC<TraceCardProps> = ({ event }) => {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border-2 border-slate-50 h-[130px] relative overflow-hidden flex flex-col">
      {/* Title Header - Matching RealtimeCard style */}
      <div className="flex justify-between items-center mb-2 flex-shrink-0">
        <div className="text-lg font-black text-slate-800 border-l-[6px] border-brand-blue pl-3 flex items-center gap-2">
          执行节点全链路追踪
        </div>
        <div className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-500 font-black tracking-wider uppercase">
            监测对象：<span className="text-brand-blue">工地人员确认率</span>
          </span>
        </div>
      </div>
      
      {/* Timeline Track - Optimized for 100% zoom */}
      <div className="relative flex justify-between items-start px-4 mt-0 flex-1">
        {/* Background Track Line */}
        <div className="absolute top-[12px] left-[60px] right-[60px] h-[3px] bg-slate-100 rounded-full z-0"></div>
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-[12px] left-[60px] h-[3px] bg-gradient-to-r from-brand-blue to-safe z-0 transition-all duration-1000 ease-in-out rounded-full shadow-[0_0_10px_rgba(41,121,255,0.2)]"
          style={{ 
            width: event.progress === 100 ? 'calc(100% - 120px)' : 
                   event.progress >= 80 ? 'calc(66.6% - 120px + 40px)' : 
                   event.progress >= 50 ? 'calc(33.3% - 120px + 80px)' : '0%'
          }}
        ></div>

        <TraceNode 
          time={event.timeline.start} 
          label="任务下达" 
          active={true} 
        />
        <TraceNode 
          time={event.progress >= 50 ? event.timeline.p50 : ''} 
          label="50%确认" 
          active={event.progress >= 50} 
        />
        <TraceNode 
          time={event.progress >= 80 ? event.timeline.p80 : ''} 
          label="80%确认" 
          active={event.progress >= 80} 
        />
        <TraceNode 
          time={event.progress >= 100 ? event.timeline.p100 : ''} 
          label="闭环完成" 
          active={event.progress >= 100} 
        />
      </div>
    </div>
  );
};

const TraceNode = ({ time, label, active }: { time: string, label: string, active: boolean }) => {
  const parts = time.split(' ');
  const datePart = (parts[0] || '').substring(5).replace('-', '/');
  const timePart = parts[1] || '--:--';

  return (
    <div className={`relative z-10 flex flex-col items-center flex-1 transition-all duration-700 ${active ? 'opacity-100' : 'opacity-30'}`}>
      {/* Node Marker */}
      <div className={`relative w-6 h-6 flex items-center justify-center mb-1 transition-all duration-700`}>
        <div className={`absolute inset-0 rounded-full border-2 transition-all duration-500 scale-110 ${active ? 'border-brand-blue/30 bg-white' : 'border-slate-200 bg-white'}`}></div>
        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${active ? 'bg-brand-blue shadow-[0_0_8px_rgba(41,121,255,0.4)]' : 'bg-slate-200'}`}></div>
      </div>

      {/* Node Data Info */}
      <div className="flex flex-col gap-0 min-h-[26px] w-full text-center">
        <div className={`font-oswald font-bold text-[9px] tracking-widest ${active ? 'text-slate-400' : 'text-slate-300'}`}>
          {datePart || 'PENDING'}
        </div>
        <div className={`font-oswald font-black text-xs leading-none tracking-tight ${active ? 'text-slate-800' : 'text-slate-300'}`}>
          {timePart}
        </div>
      </div>

      {/* Label Badge */}
      <div className={`text-[9px] mt-1 font-black tracking-widest transition-all duration-500 px-1.5 py-0.5 rounded-md border
        ${active ? 'text-brand-blue border-brand-blue/20 bg-blue-50/50' : 'text-slate-300 border-transparent'}
      `}>
        {label}
      </div>
    </div>
  );
};