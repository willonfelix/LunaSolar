import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { AstronomySnapshot, ObserverLocation } from '../types';
import { getSolarTerminatorCurve, getMoonVisibilityPolygon } from '../utils/astronomy';
import { Globe, Sun, Moon, MapPin, Info } from 'lucide-react';

interface GlobalVisibilityMapProps {
  snapshot: AstronomySnapshot;
  onSelectLocation: (loc: ObserverLocation) => void;
}

export const GlobalVisibilityMap: React.FC<GlobalVisibilityMapProps> = ({ snapshot, onSelectLocation }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const shadowLayerRef = useRef<L.Polygon | null>(null);
  const moonVisLayerRef = useRef<L.Polygon | null>(null);
  const subSolarMarkerRef = useRef<L.Marker | null>(null);
  const subLunarMarkerRef = useRef<L.Marker | null>(null);
  const observerMarkerRef = useRef<L.Marker | null>(null);

  const { subSolarPoint, subLunarPoint, observer, sun, moon, timestamp } = snapshot;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create Leaflet map
      const map = L.map(mapContainerRef.current, {
        center: [observer.latitude, observer.longitude],
        zoom: 2,
        minZoom: 1,
        maxZoom: 10,
        worldCopyJump: true,
        attributionControl: false,
      });

      // CartoDB Dark Matter tile layer for deep space dark aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Handle map clicks to pick observer location
      map.on('click', (e: L.LeafletMouseEvent) => {
        const lat = Math.round(e.latlng.lat * 100) / 100;
        const lon = Math.round(e.latlng.lng * 100) / 100;
        onSelectLocation({
          latitude: lat,
          longitude: lon,
          name: `Lat: ${lat}°, Lon: ${lon}°`,
        });
      });

      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount if needed
    };
  }, []);

  // Update map overlays on snapshot change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Solar Night Terminator Shadow Polygon
    const terminatorPoints = getSolarTerminatorCurve(subSolarPoint.latitude, subSolarPoint.longitude);
    // Create dark night polygon covering hemisphere opposite to subsolar point
    // Build full globe boundary with terminator curve
    const nightPolyPoints: [number, number][] = [];
    
    // Determine whether South Pole or North Pole is in darkness based on subSolarLat
    const isSouthInNight = subSolarPoint.latitude > 0;
    if (isSouthInNight) {
      nightPolyPoints.push([-90, -180]);
      terminatorPoints.forEach(([lat, lon]) => nightPolyPoints.push([lat, lon]));
      nightPolyPoints.push([-90, 180]);
    } else {
      nightPolyPoints.push([90, -180]);
      terminatorPoints.forEach(([lat, lon]) => nightPolyPoints.push([lat, lon]));
      nightPolyPoints.push([90, 180]);
    }

    if (shadowLayerRef.current) {
      shadowLayerRef.current.setLatLngs(nightPolyPoints);
    } else {
      shadowLayerRef.current = L.polygon(nightPolyPoints, {
        color: '#020617',
        fillColor: '#000000',
        fillOpacity: 0.55,
        weight: 2,
        dashArray: '4, 4',
      }).addTo(map);
    }

    // 2. Moon Visibility Zone Polygon (where Moon is above horizon)
    const moonPolyPoints = getMoonVisibilityPolygon(subLunarPoint.latitude, subLunarPoint.longitude);
    const moonZonePoints: [number, number][] = [];
    const isSouthMoonNight = subLunarPoint.latitude < 0;
    if (isSouthMoonNight) {
      moonZonePoints.push([-90, -180]);
      moonPolyPoints.forEach(([lat, lon]) => moonZonePoints.push([lat, lon]));
      moonZonePoints.push([-90, 180]);
    } else {
      moonZonePoints.push([90, -180]);
      moonPolyPoints.forEach(([lat, lon]) => moonZonePoints.push([lat, lon]));
      moonZonePoints.push([90, 180]);
    }

    if (moonVisLayerRef.current) {
      moonVisLayerRef.current.setLatLngs(moonZonePoints);
    } else {
      moonVisLayerRef.current = L.polygon(moonZonePoints, {
        color: '#38bdf8',
        fillColor: '#0284c7',
        fillOpacity: 0.12,
        weight: 1.5,
      }).addTo(map);
    }

    // Custom SVG Icon Generators
    const createSunIcon = () =>
      L.divIcon({
        className: 'custom-sun-marker',
        html: `<div style="background:#f59e0b; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow: 0 0 16px #f59e0b; border: 2px solid #ffffff;">
                 <span style="font-size:14px; font-weight:bold; color:#000;">☀️</span>
               </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

    const createMoonIcon = () =>
      L.divIcon({
        className: 'custom-moon-marker',
        html: `<div style="background:#38bdf8; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow: 0 0 16px #38bdf8; border: 2px solid #ffffff;">
                 <span style="font-size:14px; font-weight:bold; color:#000;">🌙</span>
               </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

    const createObserverIcon = () =>
      L.divIcon({
        className: 'custom-observer-marker',
        html: `<div style="background:#e11d48; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow: 0 0 12px #e11d48; border: 2px solid #ffffff;">
                 <div style="width:8px; height:8px; background:#fff; border-radius:50%;"></div>
               </div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

    // 3. Sub-Solar Marker
    if (subSolarMarkerRef.current) {
      subSolarMarkerRef.current.setLatLng([subSolarPoint.latitude, subSolarPoint.longitude]);
    } else {
      subSolarMarkerRef.current = L.marker([subSolarPoint.latitude, subSolarPoint.longitude], {
        icon: createSunIcon(),
      })
        .addTo(map)
        .bindTooltip('<b>Ponto Sub-Solar</b><br/>Sol no Zênite (90°)', { permanent: false, direction: 'top' });
    }

    // 4. Sub-Lunar Marker
    if (subLunarMarkerRef.current) {
      subLunarMarkerRef.current.setLatLng([subLunarPoint.latitude, subLunarPoint.longitude]);
    } else {
      subLunarMarkerRef.current = L.marker([subLunarPoint.latitude, subLunarPoint.longitude], {
        icon: createMoonIcon(),
      })
        .addTo(map)
        .bindTooltip('<b>Ponto Sub-Lunar</b><br/>Lua no Zênite (90°)', { permanent: false, direction: 'top' });
    }

    // 5. Observer Marker
    if (observerMarkerRef.current) {
      observerMarkerRef.current.setLatLng([observer.latitude, observer.longitude]);
    } else {
      observerMarkerRef.current = L.marker([observer.latitude, observer.longitude], {
        icon: createObserverIcon(),
      })
        .addTo(map)
        .bindTooltip(`<b>${observer.name}</b><br/>Sol Alt: ${Math.round(sun.altitude)}° | Lua Alt: ${Math.round(moon.altitude)}°`, { permanent: true, direction: 'top' });
    }

  }, [snapshot]);

  return (
    <div className="space-y-4">
      {/* Map Header */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold font-display text-slate-100 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" /> Mapa de Visibilidade Global em Tempo Real
          </h2>
          <p className="text-xs text-slate-400">
            Acompanhe a sombra de noite solar, pontos de Zênite e região de visibilidade da Lua. Clique no mapa para selecionar qualquer local.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></span>
            <span className="text-slate-300">Sub-Solar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-400 shadow-sm"></span>
            <span className="text-slate-300">Sub-Lunar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm"></span>
            <span className="text-slate-300">Observador</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-sky-500/30 border border-sky-400"></span>
            <span className="text-slate-300">Área Visível da Lua</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#070a12]">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Interactive Instruction Banner */}
        <div className="absolute bottom-3 left-3 z-20 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] text-slate-300 flex items-center gap-2 shadow-lg">
          <Info className="w-3.5 h-3.5 text-cyan-400" /> Clique em qualquer lugar no mapa para posicionar o seu observador.
        </div>
      </div>
    </div>
  );
};
