import * as Astronomy from 'astronomy-engine';
import * as SunCalc from 'suncalc';
import { AstronomySnapshot, CelestialPosition, EarthPoint, MoonPhaseDetails, ObserverLocation, SolarAngleData } from '../types';

/**
 * Portuguese translation and codes for Moon Phases
 */
export function getMoonPhaseDetails(date: Date): MoonPhaseDetails {
  const time = new Astronomy.AstroTime(date);
  const illumination = Astronomy.Illumination(Astronomy.Body.Moon, time);
  const phaseAngle = illumination.phase_angle; // 0 (full) to 180 (new)
  const phaseFraction = illumination.phase_fraction; // 0.0 to 1.0

  // Calculate moon age approx from last new moon
  // Synodic month is ~29.530588 days
  // Find recent new moon
  const searchStart = new Date(date.getTime() - 35 * 86400000);
  let newMoonDate = date;
  try {
    const prevNewMoon = Astronomy.SearchMoonPhase(0, new Astronomy.AstroTime(searchStart), 35);
    if (prevNewMoon) {
      newMoonDate = prevNewMoon.date;
    }
  } catch (e) {
    // fallback
  }
  const ageDays = Math.max(0, (date.getTime() - newMoonDate.getTime()) / (1000 * 3600 * 24)) % 29.530588;

  // Determine Phase Code & Name in Portuguese
  let phaseCode: MoonPhaseDetails['phaseCode'] = 'NEW';
  let phaseName = 'Lua Nova';

  // SunCalc gives phase value between 0.0 and 1.0
  const suncalcIllum = SunCalc.getMoonIllumination(date);
  const phaseVal = suncalcIllum.phase; // 0 = New, 0.25 = First Quarter, 0.5 = Full, 0.75 = Third Quarter

  if (phaseVal < 0.03 || phaseVal > 0.97) {
    phaseCode = 'NEW';
    phaseName = 'Lua Nova';
  } else if (phaseVal >= 0.03 && phaseVal < 0.22) {
    phaseCode = 'WAXING_CRESCENT';
    phaseName = 'Crescente Côncava';
  } else if (phaseVal >= 0.22 && phaseVal < 0.28) {
    phaseCode = 'FIRST_QUARTER';
    phaseName = 'Quarto Crescente';
  } else if (phaseVal >= 0.28 && phaseVal < 0.47) {
    phaseCode = 'WAXING_GIBBOUS';
    phaseName = 'Gibosa Crescente';
  } else if (phaseVal >= 0.47 && phaseVal < 0.53) {
    phaseCode = 'FULL';
    phaseName = 'Lua Cheia';
  } else if (phaseVal >= 0.53 && phaseVal < 0.72) {
    phaseCode = 'WANING_GIBBOUS';
    phaseName = 'Gibosa Minguante';
  } else if (phaseVal >= 0.72 && phaseVal < 0.78) {
    phaseCode = 'THIRD_QUARTER';
    phaseName = 'Quarto Minguante';
  } else {
    phaseCode = 'WANING_CRESCENT';
    phaseName = 'Minguante Côncava';
  }

  // Calculate next 4 major moon phases
  const nextPhases: MoonPhaseDetails['nextPhases'] = [];
  const phasesToSearch = [
    { target: 0, name: 'Lua Nova', code: 'NEW' },
    { target: 90, name: 'Quarto Crescente', code: 'FIRST_QUARTER' },
    { target: 180, name: 'Lua Cheia', code: 'FULL' },
    { target: 270, name: 'Quarto Minguante', code: 'THIRD_QUARTER' },
  ];

  const startTime = new Astronomy.AstroTime(date);
  for (const p of phasesToSearch) {
    try {
      const match = Astronomy.SearchMoonPhase(p.target, startTime, 35);
      if (match) {
        nextPhases.push({
          name: p.name,
          date: match.date,
          code: p.code,
        });
      }
    } catch (err) {
      // ignore individual failure
    }
  }

  nextPhases.sort((a, b) => a.date.getTime() - b.date.getTime());

  return {
    phaseAngle,
    phaseFraction,
    illuminationPct: Math.round(phaseFraction * 1000) / 10,
    phaseName,
    phaseCode,
    ageDays: Math.round(ageDays * 10) / 10,
    nextPhases,
  };
}

/**
 * Calculates Sub-Solar and Sub-Lunar points on Earth surface (where Sun/Moon is at zenith)
 */
export function getCelestialZenithPoints(date: Date): { subSolar: EarthPoint; subLunar: EarthPoint } {
  const time = new Astronomy.AstroTime(date);

  // Sun Greenwich Hour Angle & Declination
  const sunEquator = Astronomy.Equator(Astronomy.Body.Sun, time, new Astronomy.Observer(0, 0, 0), true, true);
  const siderealTime = Astronomy.SiderealTime(time); // in hours
  // Longitude = (RA - SiderealTime) in degrees, normalized to -180 to +180
  let subSolarLon = (sunEquator.ra - siderealTime) * 15;
  while (subSolarLon > 180) subSolarLon -= 360;
  while (subSolarLon < -180) subSolarLon += 360;
  const subSolarLat = sunEquator.dec;

  // Moon Greenwich Hour Angle & Declination
  const moonEquator = Astronomy.Equator(Astronomy.Body.Moon, time, new Astronomy.Observer(0, 0, 0), true, true);
  let subLunarLon = (moonEquator.ra - siderealTime) * 15;
  while (subLunarLon > 180) subLunarLon -= 360;
  while (subLunarLon < -180) subLunarLon += 360;
  const subLunarLat = moonEquator.dec;

  return {
    subSolar: { latitude: subSolarLat, longitude: subSolarLon },
    subLunar: { latitude: subLunarLat, longitude: subLunarLon },
  };
}

/**
 * Calculates 3D/Graphical solar incidence angles on Lunar surface
 */
export function getSolarLightingAngles(date: Date): SolarAngleData {
  const time = new Astronomy.AstroTime(date);
  const illumination = Astronomy.Illumination(Astronomy.Body.Moon, time);
  const librations = Astronomy.Libration(time);

  // Angle between Sun-Moon and Earth-Moon lines
  const phaseAngle = illumination.phase_angle;

  // Elongation: Angle between Sun and Moon as seen from Earth
  const sunGeo = Astronomy.GeoVector(Astronomy.Body.Sun, time, true);
  const moonGeo = Astronomy.GeoVector(Astronomy.Body.Moon, time, true);
  const dotProduct = (sunGeo.x * moonGeo.x + sunGeo.y * moonGeo.y + sunGeo.z * moonGeo.z) / (sunGeo.Length() * moonGeo.Length());
  const elongation = (Math.acos(Math.max(-1, Math.min(1, dotProduct))) * 180) / Math.PI;

  // Libration returns the sub-Earth selenographic latitude/longitude angles
  const subEarthLat = librations.elat;
  const subEarthLon = librations.elon;

  // Sub-solar selenographic longitude: Sun sits 180° - phaseAngle ahead of Earth
  // (Full moon → 180°, New moon → 0°)
  let subSolarLon = subEarthLon + 180 - phaseAngle;
  while (subSolarLon > 180) subSolarLon -= 360;
  while (subSolarLon < -180) subSolarLon += 360;

  // Sub-solar latitude (Meeus): Sun lies near the ecliptic plane while the
  // lunar equator is tilted I≈1.54° to it, so latitude varies with the Sun's
  // ecliptic longitude relative to the Moon's ascending node.
  const sunEcliptic = Astronomy.SunPosition(time);
  const T = time.tt / 36525.0;
  const moonNode = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T;
  const subSolarLat = 1.54242 * Math.sin(((sunEcliptic.elon - moonNode) * Math.PI) / 180);

  // Position angle of the bright limb (direction pointing to the Sun).
  // SunCalc v2 returns this in degrees; normalize to 0-360.
  const suncalcIllum = SunCalc.getMoonIllumination(date);
  const brightLimbAngle = ((suncalcIllum.angle % 360) + 360) % 360;

  // Incidence angle at center of lunar disk as seen from Earth
  // Cosine of incidence angle = cos(subsolar_lat) * cos(subsolar_lon)
  const radLat = (subSolarLat * Math.PI) / 180;
  const radLon = (subSolarLon * Math.PI) / 180;
  const cosIncidence = Math.cos(radLat) * Math.cos(radLon);
  const sunIncidenceAngleAtCenter = (Math.acos(Math.max(-1, Math.min(1, cosIncidence))) * 180) / Math.PI;

  // Longitude of lunar terminator (where day transitions to night on Moon)
  // Terminator longitude approx = subsolar_lon ± 90°
  let terminatorLongitude = subSolarLon - 90;
  while (terminatorLongitude > 180) terminatorLongitude -= 360;
  while (terminatorLongitude < -180) terminatorLongitude += 360;

  return {
    phaseAngle,
    elongation,
    subSolarLat,
    subSolarLon,
    subEarthLat,
    subEarthLon,
    brightLimbAngle,
    sunIncidenceAngleAtCenter,
    terminatorLongitude,
  };
}

/**
 * Computes full astronomy snapshot for given location and timestamp
 */
export function computeAstronomySnapshot(location: ObserverLocation, date: Date): AstronomySnapshot {
  const time = new Astronomy.AstroTime(date);
  const observer = new Astronomy.Observer(location.latitude, location.longitude, 0);

  // Sun Position
  const sunEquator = Astronomy.Equator(Astronomy.Body.Sun, time, observer, true, true);
  const sunHoriz = Astronomy.Horizon(time, observer, sunEquator.ra, sunEquator.dec, 'normal');

  // Moon Position
  const moonEquator = Astronomy.Equator(Astronomy.Body.Moon, time, observer, true, true);
  const moonHoriz = Astronomy.Horizon(time, observer, moonEquator.ra, moonEquator.dec, 'normal');

  const sunPos: CelestialPosition = {
    azimuth: (sunHoriz.azimuth + 360) % 360,
    altitude: sunHoriz.altitude,
    ra: sunEquator.ra,
    dec: sunEquator.dec,
    distanceKm: sunEquator.dist * 149597870.7,
    isAboveHorizon: sunHoriz.altitude > -0.833,
  };

  const moonPos: CelestialPosition = {
    azimuth: (moonHoriz.azimuth + 360) % 360,
    altitude: moonHoriz.altitude,
    ra: moonEquator.ra,
    dec: moonEquator.dec,
    distanceKm: moonEquator.dist * 149597870.7,
    isAboveHorizon: moonHoriz.altitude > -0.566,
  };

  const moonPhase = getMoonPhaseDetails(date);
  const { subSolar, subLunar } = getCelestialZenithPoints(date);
  const solarAngles = getSolarLightingAngles(date);

  // Sun & Moon Rise / Set times using SunCalc
  const sunTimes = SunCalc.getTimes(date, location.latitude, location.longitude);
  const moonTimes = SunCalc.getMoonTimes(date, location.latitude, location.longitude);

  return {
    timestamp: date,
    observer: location,
    sun: sunPos,
    moon: moonPos,
    moonPhase,
    subSolarPoint: subSolar,
    subLunarPoint: subLunar,
    solarAngles,
    sunRise: sunTimes.sunrise || null,
    sunSet: sunTimes.sunset || null,
    moonRise: moonTimes.rise || null,
    moonSet: moonTimes.set || null,
  };
}

/**
 * Calculates Day/Night solar terminator curve polygon coordinates on Earth map
 */
export function getSolarTerminatorCurve(subSolarLat: number, subSolarLon: number): [number, number][] {
  const points: [number, number][] = [];
  const radSubLat = (subSolarLat * Math.PI) / 180;
  const radSubLon = (subSolarLon * Math.PI) / 180;

  // Loop through longitudes from -180 to 180
  for (let lon = -180; lon <= 180; lon += 2) {
    const radLon = (lon * Math.PI) / 180;
    const deltaLon = radLon - radSubLon;
    // Great circle perpendicular latitude for solar elevation = 0
    // tan(lat) = -cos(deltaLon) / tan(subLat)
    let lat = 0;
    if (Math.abs(Math.tan(radSubLat)) > 0.0001) {
      const tanLat = -Math.cos(deltaLon) / Math.tan(radSubLat);
      lat = (Math.atan(tanLat) * 180) / Math.PI;
    } else {
      lat = 0;
    }
    points.push([lat, lon]);
  }

  return points;
}

/**
 * Calculates Moon Visibility Zone (where Moon altitude > 0° on Earth)
 */
export function getMoonVisibilityPolygon(subLunarLat: number, subLunarLon: number): [number, number][] {
  const points: [number, number][] = [];
  const radSubLat = (subLunarLat * Math.PI) / 180;
  const radSubLon = (subLunarLon * Math.PI) / 180;

  for (let lon = -180; lon <= 180; lon += 3) {
    const radLon = (lon * Math.PI) / 180;
    const deltaLon = radLon - radSubLon;
    let lat = 0;
    if (Math.abs(Math.tan(radSubLat)) > 0.0001) {
      const tanLat = -Math.cos(deltaLon) / Math.tan(radSubLat);
      lat = (Math.atan(tanLat) * 180) / Math.PI;
    } else {
      lat = 0;
    }
    points.push([lat, lon]);
  }

  return points;
}
