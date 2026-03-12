import React, { useState } from 'react';
import { Shield, Calendar, ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentYear: string;
  onYearChange: (year: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentYear, onYearChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const years = ['2026', '2025', '2024'];

  const handleYearSelect = (year: string) => {
    onYearChange(year);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex justify-between items-center px-1 mb-1 flex-shrink-0">
      <div className="text-2xl font-black tracking-widest bg-gradient-to-r from-blue-800 to-blue-500 bg-clip-text text-transparent flex items-center gap-3 drop-shadow-sm flex-shrink-0">
        <Shield className="w-7 h-7 text-brand-blue" />
        汛期工地三防作战一张图
      </div>

      <div className="relative z-50">
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="bg-white border-2 border-slate-100 rounded-full px-4 py-1.5 shadow-sm hover:bg-slate-50 transition-all duration-300 flex items-center gap-3 min-w-[130px] justify-between text-slate-700 font-black text-sm"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{currentYear} 年度</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-[115%] right-0 w-full bg-white border border-slate-200 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-100">
            {years.map(year => (
              <div 
                key={year}
                onClick={() => handleYearSelect(year)}
                className={`px-3 py-2 rounded-lg text-center font-black text-sm cursor-pointer transition-colors ${
                  currentYear === year 
                    ? 'bg-brand-blue text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {year} 年度
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};