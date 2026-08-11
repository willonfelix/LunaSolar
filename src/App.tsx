import React, { useState, useEffect, useMemo } from 'react';
import { ObserverLocation } from './types';
import { computeAstronomySnapshot } from './utils/astronomy';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { GlobalVisibilityMap } from './components/GlobalVisibilityMap';
import { LunarLighting3D } from './components/LunarLighting3D';
import { AstroCalendar } from './components/AstroCalendar';
import { AstroGuide } from './components/AstroGuide';
import { Sparkles, Moon, Sun, Globe, Heart } from 'lucide-react';

export default function App() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'map' | 'lighting3d' | 'calendar' | 'guide'>('dashboard');

  const [location, setLocation] = useState<ObserverLocation>({
    latitude: -15.7801,
    longitude: -47.9292,
    name: 'Brasília, Brasil',
  });

  const [pwaPrompt, setPwaPrompt] = useState<any>(null);

  // Auto-detect browser geolocation on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            name: 'Minha Localização',
          });
        },
        () => {
          // Keep default
        },
        { timeout: 5000 }
      );
    }

    // PWA Install Prompt Listener
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setPwaPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Real-time ticker interval
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setCurrentDate((prev) => new Date(prev.getTime() + 1000 * speed));
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, speed]);

  // Compute astronomical snapshot
  const snapshot = useMemo(() => {
    return computeAstronomySnapshot(location, currentDate);
  }, [location, currentDate]);

  const handleInstallPWA = () => {
    if (pwaPrompt) {
      pwaPrompt.prompt();
      pwaPrompt.userChoice.then(() => {
        setPwaPrompt(null);
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        isLive={isLive}
        setIsLive={setIsLive}
        speed={speed}
        setSpeed={setSpeed}
        location={location}
        setLocation={setLocation}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pwaInstallPrompt={pwaPrompt}
        onInstallPWA={handleInstallPWA}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard snapshot={snapshot} onNavigateTab={setActiveTab} />
        )}

        {activeTab === 'lighting3d' && (
          <LunarLighting3D snapshot={snapshot} />
        )}

        {activeTab === 'map' && (
          <GlobalVisibilityMap
            snapshot={snapshot}
            onSelectLocation={(newLoc) => {
              setLocation(newLoc);
            }}
          />
        )}

        {activeTab === 'calendar' && (
          <AstroCalendar
            currentDate={currentDate}
            onSelectDate={(d) => {
              setCurrentDate(d);
              setIsLive(false);
              setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'guide' && <AstroGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#05070e] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-display font-semibold text-slate-300">
            <Moon className="w-4 h-4 text-sky-400" /> LunaSolar PWA — Calculadora Astronômica em Tempo Real
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            Calculado com precisão orbital de Meeus/VSOP87 e mapas interativos globais.
          </div>
        </div>
      </footer>
    </div>
  );
}
