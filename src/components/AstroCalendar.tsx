import React, { useState } from 'react';
import { Calendar, Moon, Sun, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { getMoonPhaseDetails } from '../utils/astronomy';

interface AstroCalendarProps {
  currentDate: Date;
  onSelectDate: (d: Date) => void;
}

export const AstroCalendar: React.FC<AstroCalendarProps> = ({ currentDate, onSelectDate }) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  // Generate days in month
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-display text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" /> Calendário & Efemérides Lunares
          </h2>
          <p className="text-xs text-slate-400">
            Acompanhe o ciclo das fases da Lua, porcentagem de iluminação e iluminação diária em qualquer mês do ano.
          </p>
        </div>

        {/* Month Navigator Controls */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold font-display text-slate-100 px-2">
            {monthNames[selectedMonth]} {selectedYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-5 shadow-2xl">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-3 text-center text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-2">
          <span>Dom</span>
          <span>Seg</span>
          <span>Ter</span>
          <span>Qua</span>
          <span>Qui</span>
          <span>Sex</span>
          <span>Sáb</span>
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty padding cells */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 bg-slate-950/30 rounded-xl border border-transparent"></div>
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayDate = new Date(selectedYear, selectedMonth, dayNum, 12, 0, 0);
            const phase = getMoonPhaseDetails(dayDate);
            const isToday =
              currentDate.getDate() === dayNum &&
              currentDate.getMonth() === selectedMonth &&
              currentDate.getFullYear() === selectedYear;

            return (
              <button
                key={dayNum}
                onClick={() => onSelectDate(dayDate)}
                className={`h-24 p-2 rounded-xl border flex flex-col justify-between text-left transition-all relative overflow-hidden group ${
                  isToday
                    ? 'bg-cyan-950/50 border-cyan-500 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs font-bold ${isToday ? 'text-cyan-300 font-mono text-sm' : 'text-slate-200'}`}>
                    {dayNum}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {phase.illuminationPct}%
                  </span>
                </div>

                {/* Phase Icon & Name */}
                <div className="flex items-center gap-1.5 my-1">
                  <div className="w-5 h-5 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-sky-300">
                    <Moon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-300 truncate max-w-[70px]">
                    {phase.phaseName}
                  </span>
                </div>

                {/* Major Phase Indicator Badge */}
                {(phase.phaseCode === 'NEW' || phase.phaseCode === 'FIRST_QUARTER' || phase.phaseCode === 'FULL' || phase.phaseCode === 'THIRD_QUARTER') && (
                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60 self-start">
                    ★
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
