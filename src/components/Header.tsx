import React, { useState, useEffect } from 'react';
import { Sun, Moon, MapPin, Play, Pause, RotateCcw, FastForward, Calendar, Globe, Compass, Box, Info, Download, Search } from 'lucide-react';
import { ObserverLocation } from '../types';

interface HeaderProps {
  currentDate: Date;
  setCurrentDate: (d: Date | ((prev: Date) => Date)) => void;
  isLive: boolean;
  setIsLive: (live: boolean) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  location: ObserverLocation;
  setLocation: (loc: ObserverLocation) => void;
  activeTab: 'dashboard' | 'map' | 'lighting3d' | 'calendar' | 'guide';
  setActiveTab: (tab: 'dashboard' | 'map' | 'lighting3d' | 'calendar' | 'guide') => void;
  pwaInstallPrompt: any;
  onInstallPWA: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  setCurrentDate,
  isLive,
  setIsLive,
  speed,
  setSpeed,
  location,
  setLocation,
  activeTab,
  setActiveTab,
  pwaInstallPrompt,
  onInstallPWA,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Search geocoding via /api/geocode
  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data || []);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (res: any) => {
    const lat = parseFloat(res.lat);
    const lon = parseFloat(res.lon);
    const name = res.display_name.split(',')[0] || res.display_name;
    setLocation({ latitude: lat, longitude: lon, name });
    setShowLocationModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            name: 'Minha Localização',
          });
          setShowLocationModal(false);
        },
        (err) => {
          alert('Não foi possível obter a localização. Por favor, pesquise manualmente.');
        }
      );
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Top bar: Title + Time Controller + Location + PWA Button */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-sky-500 to-indigo-600 p-[2px] shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <Moon className="w-5 h-5 text-sky-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-display tracking-tight bg-gradient-to-r from-slate-100 via-sky-200 to-cyan-400 bg-clip-text text-transparent">
                  LunaSolar
                </h1>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  Tempo Real
                </span>
              </div>
              <p className="text-xs text-slate-400">Posição, Sombras e Ângulos Lunares</p>
            </div>
          </div>

          {/* Time Controller & Simulation Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-semibold px-2 py-1 bg-slate-950 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              {currentDate.toLocaleDateString('pt-BR')} {currentDate.toLocaleTimeString('pt-BR')}
            </div>

            <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
              <button
                onClick={() => setIsLive(!isLive)}
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium ${
                  isLive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title={isLive ? 'Pausar simulação' : 'Retomar tempo real'}
              >
                {isLive ? <Pause className="w-3.5 h-3.5 text-cyan-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isLive ? 'Ao Vivo' : 'Pausado'}</span>
              </button>

              <button
                onClick={() => {
                  setCurrentDate(new Date());
                  setIsLive(true);
                  setSpeed(1);
                }}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
                title="Agora"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500"
                title="Velocidade da Simulação"
              >
                <option value={1}>1x (Real)</option>
                <option value={60}>60x (1min/s)</option>
                <option value={3600}>3600x (1h/s)</option>
                <option value={86400}>86400x (1dia/s)</option>
              </select>
            </div>
          </div>

          {/* Location Selector & PWA Install Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-all shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span className="max-w-[120px] sm:max-w-[160px] truncate">{location.name}</span>
            </button>

            {pwaInstallPrompt && (
              <button
                onClick={onInstallPWA}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 hover:brightness-110 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Instalar PWA</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center justify-center sm:justify-start gap-1 mt-3 pt-2 border-t border-slate-800/60 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'dashboard'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Painel Principal</span>
          </button>

          <button
            onClick={() => setActiveTab('lighting3d')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'lighting3d'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Box className="w-4 h-4 text-amber-400" />
            <span>Luz Solar & Ângulos 3D</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'map'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Mapa de Visibilidade Global</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'calendar'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-4 h-4 text-sky-400" />
            <span>Calendário & Efemérides</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'guide'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Info className="w-4 h-4 text-emerald-400" />
            <span>Guia de Física Astronômica</span>
          </button>
        </nav>
      </div>

      {/* Location Search Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" /> Alterar Localização
              </h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-slate-400 hover:text-slate-100 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <button
              onClick={handleUseCurrentLocation}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/20 transition-all"
            >
              <MapPin className="w-4 h-4 text-cyan-400" /> Detectar Minha Posição Atual (GPS)
            </button>

            <form onSubmit={handleSearchLocation} className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: São Paulo, Rio de Janeiro, Lisboa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 bg-cyan-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-cyan-400 disabled:opacity-50 transition-all flex items-center gap-1"
              >
                <Search className="w-3.5 h-3.5" /> Buscar
              </button>
            </form>

            {/* Results list */}
            {searchResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-slate-800/50">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectLocation(res)}
                    className="w-full text-left p-2 hover:bg-slate-800 rounded-lg text-xs text-slate-300 transition-colors block truncate"
                  >
                    {res.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
