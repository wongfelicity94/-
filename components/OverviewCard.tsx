import React from 'react';
import { AlertTriangle, MapPin, Construction, Users } from 'lucide-react';
import { EventData } from '../types';
import { getWarningStyles } from '../utils';

interface OverviewCardProps {
  event: EventData;
}

export const OverviewCard: React.FC<OverviewCardProps> = ({ event }) => {
  const warnStyle = getWarningStyles(event.warningType);
  const transferredPeople = Math.floor(event.people * event.progress / 100);

  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200 flex flex-col gap-2 overflow-hidden relative">
      {/* 头部信息 - 紧凑展示 */}
      <div className="flex flex-col gap-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className={`px-3 py-1 rounded-xl font-black text-lg tracking-widest shadow-lg flex items-center gap-2 border-2 border-white/30 ${warnStyle.bg} ${warnStyle.text} ${warnStyle.shadow} animate-in fade-in slide-in-from-top-4 duration-700`}>
            <AlertTriangle className="w-5 h-5" />
            {event.warningType}
          </div>
          <div className="text-xs text-slate-400 font-black font-oswald tracking-widest">{event.fullDate}</div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center justify-center gap-1 bg-blue-50/50 px-2 py-3 rounded-2xl border border-blue-100 flex-1 hover:bg-blue-50 transition-colors group shadow-sm">
            <MapPin className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform mb-0.5" />
            <div className="text-4xl font-black text-blue-900 leading-none font-oswald tracking-tighter">{event.involvedTowns}</div>
            <span className="text-[10px] text-blue-600/70 font-bold uppercase tracking-wider">涉及镇街</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 bg-orange-50/50 px-2 py-3 rounded-2xl border border-orange-100 flex-1 hover:bg-orange-50 transition-colors group shadow-sm">
            <Construction className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform mb-0.5" />
            <div className="text-4xl font-black text-orange-900 leading-none font-oswald tracking-tighter">{event.sites}</div>
            <span className="text-[10px] text-orange-600/70 font-bold uppercase tracking-wider">涉及工地</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 bg-green-50/50 px-2 py-3 rounded-2xl border border-green-100 flex-1 hover:bg-green-50 transition-colors group shadow-sm">
            <Users className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform mb-0.5" />
            <div className="text-4xl font-black text-green-900 leading-none font-oswald tracking-tighter">{transferredPeople.toLocaleString()}</div>
            <span className="text-[10px] text-green-600/70 font-bold uppercase tracking-wider">已转移人员</span>
          </div>
        </div>
      </div>

      {/* 消息正文 - 使用 clamp 限制高度 */}
      <div className="bg-amber-50/60 border border-amber-200/30 text-amber-950 px-4 py-2 rounded-xl text-[14px] leading-snug relative overflow-hidden flex flex-col justify-center">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-400/80"></div>
        <div className="relative z-10 font-bold italic line-clamp-3">
          {event.msg}
          <div className="text-[10px] text-amber-700/60 not-italic mt-1 border-t border-amber-200/20 pt-1 flex items-center gap-2 font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
            中心全程动态监测
          </div>
        </div>
      </div>
    </div>
  );
};