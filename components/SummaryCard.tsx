import React, { useMemo } from 'react';
import { EventData } from '../types';
import { getWarningStyles } from '../utils';

interface SummaryCardProps {
  events: EventData[];
  currentYear: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ events, currentYear }) => {
  const stats = useMemo(() => {
    const totalPeople = events.reduce((acc, cur) => acc + cur.people, 0);
    
    const finishedEvents = events.filter(e => e.duration !== '-');
    const avgDur = finishedEvents.length > 0 
      ? (finishedEvents.reduce((sum, e) => sum + parseInt(e.duration), 0) / finishedEvents.length).toFixed(1) + '小时' 
      : '-';

    return { totalPeople, avgDur };
  }, [events]);

  return (
    <div className="bg-white/75 backdrop-blur-xl border border-white/90 rounded-2xl shadow-[10px_10px_30px_rgba(166,180,200,0.35),-10px_-10px_30px_rgba(255,255,255,0.9)] p-3 flex flex-col h-full overflow-hidden">
      <div className="text-base font-black text-slate-700 mb-2 border-l-4 border-brand-blue pl-3 flex-shrink-0">
        {currentYear} 年度事件数据清单
      </div>

      <div className="flex justify-around bg-gradient-to-br from-[#673ab7] to-[#512da8] text-white rounded-xl p-2 mb-2 shadow-lg shadow-purple-500/30 flex-shrink-0">
        <SummaryStat val={events.length} label="总事件数" />
        <SummaryStat val={stats.totalPeople} label="总转移人数" />
        <SummaryStat val="100%" label="响应完成率" />
        <SummaryStat val={stats.avgDur} label="平均达标耗时" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        <table className="w-full text-[12px] border-collapse">
          <thead className="sticky top-0 bg-white z-10 text-slate-400 font-medium">
            <tr>
              <th className="text-left p-2 border-b-2 border-slate-100">事件名称</th>
              <th className="text-left p-2 border-b-2 border-slate-100">涉及镇街</th>
              <th className="text-left p-2 border-b-2 border-slate-100">涉及工地</th>
              <th className="text-left p-2 border-b-2 border-slate-100">涉及人数</th>
              <th className="text-left p-2 border-b-2 border-slate-100">耗时</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => {
              const badgeStyle = getWarningStyles(ev.warningType);
              return (
                <tr key={ev.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                  <td className="p-2">
                    <div className="font-bold text-slate-700">{ev.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 mb-1">{ev.fullDate}</div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${badgeStyle.bg} text-white shadow-sm`}>
                      {ev.warningType}
                    </span>
                  </td>
                  <td className="p-2 font-bold text-slate-600">{ev.involvedTowns}</td>
                  <td className="p-2 font-bold text-slate-600">{ev.sites}</td>
                  <td className="p-2 font-bold text-warn-orange">{ev.people}</td>
                  <td className="p-2 text-slate-400 font-medium">{ev.duration}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SummaryStat = ({ val, label }: { val: string | number, label: string }) => (
  <div className="text-center">
    <div className="font-oswald font-bold text-lg">{val}</div>
    <div className="text-[10px] opacity-80">{label}</div>
  </div>
);