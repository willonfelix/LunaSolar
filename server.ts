import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as Astronomy from "astronomy-engine";

const app = express();
const PORT = Number(process.env.PORT) || 3004;

app.use(express.json());

// API route: Geocode search using OpenStreetMap Nominatim
app.get("/api/geocode", async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: "Parâmetro 'q' é obrigatório." });
    }
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=pt-BR`,
      {
        headers: {
          "User-Agent": "LunaSolar-Astronomy-App/1.0",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Falha na consulta ao serviço de geocodificação.");
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro de servidor ao buscar local." });
  }
});

// API route: Astronomy data for server side or API consumers
app.get("/api/astronomy", (req, res) => {
  try {
    const lat = parseFloat((req.query.lat as string) || "0");
    const lon = parseFloat((req.query.lon as string) || "0");
    const dateStr = (req.query.date as string) || new Date().toISOString();
    const date = new Date(dateStr);

    const observer = new Astronomy.Observer(lat, lon, 0);
    const time = new Astronomy.AstroTime(date);

    // Sun & Moon Equatorial & Horizon
    const sunEquator = Astronomy.Equator(Astronomy.Body.Sun, time, observer, true, true);
    const sunHoriz = Astronomy.Horizon(time, observer, sunEquator.ra, sunEquator.dec, "normal");

    const moonEquator = Astronomy.Equator(Astronomy.Body.Moon, time, observer, true, true);
    const moonHoriz = Astronomy.Horizon(time, observer, moonEquator.ra, moonEquator.dec, "normal");

    const illumination = Astronomy.Illumination(Astronomy.Body.Moon, time);
    const phaseAngle = illumination.phase_angle;
    const phaseFraction = illumination.phase_fraction;

    // Sub-solar and Sub-lunar points on Earth
    const subSolar = Astronomy.SearchHourAngle(Astronomy.Body.Sun, observer, 0, time);
    const sunGeo = Astronomy.GeoVector(Astronomy.Body.Sun, time, true);
    const subSolarLat = (Math.asin(sunGeo.z / sunGeo.Length()) * 180) / Math.PI;

    const moonGeo = Astronomy.GeoVector(Astronomy.Body.Moon, time, true);
    const subLunarLat = (Math.asin(moonGeo.z / moonGeo.Length()) * 180) / Math.PI;

    res.json({
      time: date.toISOString(),
      observer: { latitude: lat, longitude: lon },
      sun: {
        azimuth: sunHoriz.azimuth,
        altitude: sunHoriz.altitude,
        ra: sunEquator.ra,
        dec: sunEquator.dec,
        distKm: sunEquator.dist * 149597870.7,
      },
      moon: {
        azimuth: moonHoriz.azimuth,
        altitude: moonHoriz.altitude,
        ra: moonEquator.ra,
        dec: moonEquator.dec,
        distKm: moonEquator.dist * 149597870.7,
        phaseAngle: phaseAngle,
        phaseFraction: phaseFraction,
        illuminationPct: Math.round(phaseFraction * 100),
      },
      subSolar: { latitude: subSolarLat },
      subLunar: { latitude: subLunarLat },
    });
  } catch (err: any) {
    const message = typeof err === "string" ? err : err?.message || "Erro desconhecido no cálculo astronômico.";
    res.status(500).json({ error: message });
  }
});

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[LunaSolar] Servidor rodando na porta ${PORT}`);
  });
}

start();
