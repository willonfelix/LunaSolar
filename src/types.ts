export interface ObserverLocation {
  latitude: number;
  longitude: number;
  name: string;
}

export interface CelestialPosition {
  azimuth: number; // degrees 0-360
  altitude: number; // degrees -90 to 90
  ra: number; // right ascension in hours or degrees
  dec: number; // declination in degrees
  distanceKm: number;
  isAboveHorizon: boolean;
}

export interface MoonPhaseDetails {
  phaseAngle: number; // degrees 0-180
  phaseFraction: number; // 0 to 1
  illuminationPct: number; // 0 to 100
  phaseName: string;
  phaseCode: 'NEW' | 'WAXING_CRESCENT' | 'FIRST_QUARTER' | 'WAXING_GIBBOUS' | 'FULL' | 'WANING_GIBBOUS' | 'THIRD_QUARTER' | 'WANING_CRESCENT';
  ageDays: number; // days since last new moon (0-29.53)
  nextPhases: {
    name: string;
    date: Date;
    code: string;
  }[];
}

export interface EarthPoint {
  latitude: number;
  longitude: number;
}

export interface SolarAngleData {
  phaseAngle: number; // Angle between Sun-Moon and Earth-Moon lines
  elongation: number; // Angular distance between Sun and Moon as seen from Earth
  subSolarLat: number; // Lunar latitude where Sun is directly overhead
  subSolarLon: number; // Lunar longitude where Sun is directly overhead
  subEarthLat: number; // Lunar latitude pointing to Earth
  subEarthLon: number; // Lunar longitude pointing to Earth
  brightLimbAngle: number; // Position angle of the bright limb (degrees)
  sunIncidenceAngleAtCenter: number; // Incidence angle of sunlight at sub-Earth point
  terminatorLongitude: number; // Longitude of the lunar terminator
}

export interface AstronomySnapshot {
  timestamp: Date;
  observer: ObserverLocation;
  sun: CelestialPosition;
  moon: CelestialPosition;
  moonPhase: MoonPhaseDetails;
  subSolarPoint: EarthPoint;
  subLunarPoint: EarthPoint;
  solarAngles: SolarAngleData;
  sunRise: Date | null;
  sunSet: Date | null;
  moonRise: Date | null;
  moonSet: Date | null;
}
