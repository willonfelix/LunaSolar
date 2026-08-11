import React from 'react';
import { CelestialPosition } from '../types';
import { Sun, Moon, Navigation } from 'lucide-react';

interface SkyRadarProps {
  sun: CelestialPosition;
  moon: CelestialPosition;
  observerName: string;
}

export const SkyRadar: React.FC<SkyRadarProps> = ({ sun, moon, observerName }) => {
  const size = 260;
  const radius = size / 2 - 24;
  const cx = size / 2;
  const cy = size / 2;

  // Convert Azimuth & Altitude to 2D polar projection on Horizon Dial
  // Zenith (Altitude = +90°) is at center (cx, cy)
  // Horizon (Altitude = 0°) is at radius r
  // Nadir (Altitude = -90°) is outside or dashed
  const getCoordinates = (azimuthDeg: number, altitudeDeg: number) => {
    // Azimuth: 0° is North (Up, -Y), 90° is East (+X), 180° is South (+Y), 270° is West (-X)
    const azRad = (azimuthDeg - 90) * (Math.PI / 180);
    // Altitude: 90° -> r=0, 0° -> r=radius, -90° -> r=radius*1.2
    const altNorm = Math.max(-1, Math.min(1, altitudeDeg / 90));
    const r = radius * (1 - Math.max(0, altNorm));

    const x = cx + r * Math.cos(azRad);
    const y = cy + r * Math.sin(azRad);
    return { x, y, r };
  };

  const sunCoords = getCoordinates(sun.azimuth, sun.altitude);
  const moonCoords = getCoordinates(moon.azimuth, moon.altitude);

  return (
    <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Navigation className="w-4 h-4 text-cyan-400" /> Radar do Céu Local
        </h3>
        <span className="text-[11px] font-mono text-slate-400 truncate max-w-[140px]">{observerName}</span>
      </div>

      {/* Radar SVG Dial */}
      <div className="relative">
        <svg width={size} height={size} className="overflow-visible">
          {/* Outer Horizon Ring */}
          <circle cx={cx} cy={cy} r={radius} fill="#070a12" stroke="#1e293b" strokeWidth="2" />

          {/* Altitude Concentric Rings (30°, 60°, Horizon 0°) */}
          <circle cx={cx} cy={cy} r={radius * (2 / 3)} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={cx} cy={cy} r={radius * (1 / 3)} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />

          {/* Zenith Center Point */}
          <circle cx={cx} cy={cy} r="3" fill="#38bdf8" />
          <text x={cx} y={cy - 6} textAnchor="middle" fill="#64748b" fontSize="8" className="font-mono font-semibold">
            Zênite (90°)
          </text>

          {/* Cardinal Cross Lines */}
          <line x1={cx} y1={cy - radius} x2={cx} y2={cy + radius} stroke="#1e293b" strokeWidth="1" />
          <line x1={cx - radius} y1={cy} x2={cx + radius} y2={cy} stroke="#1e293b" strokeWidth="1" />

          {/* Cardinal Labels */}
          <text x={cx} y={cy - radius - 8} textAnchor="middle" fill="#f8fafc" fontSize="11" className="font-bold">
            N (0°)
          </text>
          <text x={cx + radius + 12} y={cy + 4} textAnchor="middle" fill="#f8fafc" fontSize="11" className="font-bold">
            L (90°)
          </text>
          <text x={cx} y={cy + radius + 16} textAnchor="middle" fill="#f8fafc" fontSize="11" className="font-bold">
            S (180°)
          </text>
          <text x={cx - radius - 12} y={cy + 4} textAnchor="middle" fill="#f8fafc" fontSize="11" className="font-bold">
            O (270°)
          </text>

          {/* Sun Position Line & Icon */}
          <line x1={cx} y1={cy} x2={sunCoords.x} y2={sunCoords.y} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.6" />
          <g transform={`translate(${sunCoords.x - 12}, ${sunCoords.y - 12})`}>
            <circle cx="12" cy="12" r="12" fill={sun.isAboveHorizon ? '#f59e0b' : '#78350f'} opacity={sun.isAboveHorizon ? '0.9' : '0.5'} />
            <circle cx="12" cy="12" r="16" fill="none" stroke="#f59e0b" strokeWidth="1" opacity={sun.isAboveHorizon ? '0.5' : '0.2'} />
            <foreignObject x="4" y="4" width="16" height="16">
              <Sun className="w-4 h-4 text-slate-950" />
            </foreignObject>
          </g>

          {/* Moon Position Line & Icon */}
          <line x1={cx} y1={cy} x2={moonCoords.x} y2={moonCoords.y} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.6" />
          <g transform={`translate(${moonCoords.x - 12}, ${moonCoords.y - 12})`}>
            <circle cx="12" cy="12" r="12" fill={moon.isAboveHorizon ? '#38bdf8' : '#1e3a8a'} opacity={moon.isAboveHorizon ? '0.9' : '0.5'} />
            <circle cx="12" cy="12" r="16" fill="none" stroke="#38bdf8" strokeWidth="1" opacity={moon.isAboveHorizon ? '0.5' : '0.2'} />
            <foreignObject x="4" y="4" width="16" height="16">
              <Moon className="w-4 h-4 text-slate-950" />
            </foreignObject>
          </g>
        </svg>
      </div>

      {/* Numerical Sky Position Readout */}
      <div className="grid grid-cols-2 gap-2 w-full mt-3 pt-3 border-t border-slate-800 text-xs">
        {/* Sun Box */}
        <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-2 space-y-0.5">
          <div className="flex items-center gap-1 font-bold text-amber-400">
            <Sun className="w-3.5 h-3.5" /> Sol
          </div>
          <div className="text-slate-300 font-mono text-[11px]">
            Azim: <span className="font-bold text-slate-100">{Math.round(sun.azimuth)}°</span>
          </div>
          <div className="text-slate-300 font-mono text-[11px]">
            Alt: <span className={`font-bold ${sun.isAboveHorizon ? 'text-emerald-400' : 'text-slate-400'}`}>
              {Math.round(sun.altitude * 10) / 10}° {sun.isAboveHorizon ? '▲' : '▼'}
            </span>
          </div>
        </div>

        {/* Moon Box */}
        <div className="bg-sky-950/20 border border-sky-900/40 rounded-xl p-2 space-y-0.5">
          <div className="flex items-center gap-1 font-bold text-sky-400">
            <Moon className="w-3.5 h-3.5" /> Lua
          </div>
          <div className="text-slate-300 font-mono text-[11px]">
            Azim: <span className="font-bold text-slate-100">{Math.round(moon.azimuth)}°</span>
          </div>
          <div className="text-slate-300 font-mono text-[11px]">
            Alt: <span className={`font-bold ${moon.isAboveHorizon ? 'text-emerald-400' : 'text-slate-400'}`}>
              {Math.round(moon.altitude * 10) / 10}° {moon.isAboveHorizon ? '▲' : '▼'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
