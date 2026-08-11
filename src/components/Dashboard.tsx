import React from 'react';
import { AstronomySnapshot } from '../types';
import { Moon2DView } from './Moon2DView';
import { SkyRadar } from './SkyRadar';
import { Sun, Moon, Calendar, Eye, Compass, Globe, Sparkles, Clock, Layers } from 'lucide-react';

interface DashboardProps {
  snapshot: AstronomySnapshot;
  onNavigateTab: (tab: 'dashboard' | 'map' | 'lighting3d' | 'calendar' | 'guide') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ snapshot, onNavigateTab }) => {
  const { moonPhase, sun, moon, subSolarPoint, subLunarPoint, solarAngles, observer, sunRise, sunSet, moonRise, moonSet } = snapshot;

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Hero: Current Moon Phase & Quick Overview */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0d1627] via-[#090e1a] to-[#060810] border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Moon Render & Primary Phase Name */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 border-b lg:border-b-0 lg:border-r border-slate-800 pb-6 lg:pb-0 lg:pr-6">
            <Moon2DView phaseDetails={moonPhase} size={210} />

            <div className="text-center sm:text-left space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Fase Atual
              </span>
              <h2 className="text-3xl font-extrabold font-display text-slate-100 tracking-tight">
                {moonPhase.phaseName}
              </h2>
              <p className="text-xs text-slate-400 max-w-xs">
                Idade da Lua: <strong className="text-slate-200">{moonPhase.ageDays} dias</strong> no ciclo sinódico de 29,5 dias.
              </p>

              <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                <button
                  onClick={() => onNavigateTab('lighting3d')}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold hover:brightness-110 transition-all shadow-md flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" /> Ver Ângulos & Luz 3D
                </button>
                <button
                  onClick={() => onNavigateTab('map')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-400" /> Visibilidade Global
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
            
            {/* Illumination */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1 hover:border-slate-700 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Eye className="w-3 h-3 text-cyan-400" /> Iluminação
              </span>
              <div className="text-xl font-bold font-mono text-cyan-300">
                {moonPhase.illuminationPct}%
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Ângulo Fase: {Math.round(moonPhase.phaseAngle)}°
              </p>
            </div>

            {/* Moon Distance */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1 hover:border-slate-700 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Moon className="w-3 h-3 text-sky-400" /> Distância da Lua
              </span>
              <div className="text-xl font-bold font-mono text-sky-300">
                {Math.round(moon.distanceKm).toLocaleString('pt-BR')} <span className="text-xs font-normal">km</span>
              </div>
              <p className="text-[11px] text-slate-400">
                ~{Math.round(moon.distanceKm / 6371)} raios terrestres
              </p>
            </div>

            {/* Sun Distance */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1 hover:border-slate-700 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-400" /> Distância do Sol
              </span>
              <div className="text-xl font-bold font-mono text-amber-300">
                {(sun.distanceKm / 1e6).toFixed(2)} <span className="text-xs font-normal">M km</span>
              </div>
              <p className="text-[11px] text-slate-400">
                1,00 Unidade Astronômica
              </p>
            </div>

            {/* Sub-Solar Point */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1 hover:border-slate-700 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-400" /> Ponto Sub-Solar (Zênite)
              </span>
              <div className="text-xs font-mono font-semibold text-slate-200 truncate">
                {subSolarPoint.latitude.toFixed(1)}°, {subSolarPoint.longitude.toFixed(1)}°
              </div>
              <p className="text-[11px] text-slate-400">
                Sol a 90° acima da cabeça
              </p>
            </div>

            {/* Sub-Lunar Point */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1 hover:border-slate-700 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Moon className="w-3 h-3 text-sky-400" /> Ponto Sub-Lunar (Zênite)
              </span>
              <div className="text-xs font-mono font-semibold text-slate-200 truncate">
                {subLunarPoint.latitude.toFixed(1)}°, {subLunarPoint.longitude.toFixed(1)}°
              </div>
              <p className="text-[11px] text-slate-400">
                Lua a 90° acima da cabeça
              </p>
            </div>

            {/* Sun Incidence Angle on Moon */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1 hover:border-slate-700 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Compass className="w-3 h-3 text-emerald-400" /> Incidência Solar Lunar
              </span>
              <div className="text-xl font-bold font-mono text-emerald-300">
                {Math.round(solarAngles.sunIncidenceAngleAtCenter)}°
              </div>
              <p className="text-[11px] text-slate-400">
                Ângulo no centro do disco
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Middle Grid: Sky Radar Dial + Horizon Rise/Set Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Sky Horizon Radar Dial */}
        <div className="md:col-span-5">
          <SkyRadar sun={sun} moon={moon} observerName={observer.name} />
        </div>

        {/* Local Horizon Timings & Next Major Phases */}
        <div className="md:col-span-7 space-y-4">
          
          {/* Rise / Set Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Sun Schedule */}
            <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sun className="w-4 h-4" /> Horários do Sol
                </h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  sun.isAboveHorizon ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-900 text-slate-400'
                }`}>
                  {sun.isAboveHorizon ? 'Dia (Acima)' : 'Noite (Abaixo)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-900/80 p-2 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Nascer do Sol</span>
                  <span className="text-slate-100 font-bold text-sm">{formatTime(sunRise)}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Pôr do Sol</span>
                  <span className="text-slate-100 font-bold text-sm">{formatTime(sunSet)}</span>
                </div>
              </div>
            </div>

            {/* Moon Schedule */}
            <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <Moon className="w-4 h-4" /> Horários da Lua
                </h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  moon.isAboveHorizon ? 'bg-sky-950 text-sky-300 border border-sky-800' : 'bg-slate-900 text-slate-400'
                }`}>
                  {moon.isAboveHorizon ? 'No Céu (Visível)' : 'Abaixo do Horizonte'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-900/80 p-2 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Nascer da Lua</span>
                  <span className="text-slate-100 font-bold text-sm">{formatTime(moonRise)}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Pôr da Lua</span>
                  <span className="text-slate-100 font-bold text-sm">{formatTime(moonSet)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Next Major Phases Schedule */}
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" /> Próximas Mudanças de Fase
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {moonPhase.nextPhases.map((phase, idx) => (
                <div key={idx} className="bg-slate-900/70 border border-slate-800 rounded-xl p-2.5 text-center space-y-1 hover:border-cyan-500/40 transition-all">
                  <div className="text-[11px] font-bold text-slate-200 truncate">{phase.name}</div>
                  <div className="text-xs font-mono text-cyan-300 font-semibold">
                    {phase.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {phase.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
