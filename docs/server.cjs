var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var Astronomy = __toESM(require("astronomy-engine"), 1);
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
app.get("/api/geocode", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: "Par\xE2metro 'q' \xE9 obrigat\xF3rio." });
    }
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=pt-BR`,
      {
        headers: {
          "User-Agent": "LunaSolar-Astronomy-App/1.0"
        }
      }
    );
    if (!response.ok) {
      throw new Error("Falha na consulta ao servi\xE7o de geocodifica\xE7\xE3o.");
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "Erro de servidor ao buscar local." });
  }
});
app.get("/api/astronomy", (req, res) => {
  try {
    const lat = parseFloat(req.query.lat || "0");
    const lon = parseFloat(req.query.lon || "0");
    const dateStr = req.query.date || (/* @__PURE__ */ new Date()).toISOString();
    const date = new Date(dateStr);
    const observer = new Astronomy.Observer(lat, lon, 0);
    const time = new Astronomy.AstroTime(date);
    const sunEquator = Astronomy.Equator(Astronomy.Body.Sun, time, observer, true, true);
    const sunHoriz = Astronomy.Horizon(time, observer, sunEquator.ra, sunEquator.dec, "normal");
    const moonEquator = Astronomy.Equator(Astronomy.Body.Moon, time, observer, true, true);
    const moonHoriz = Astronomy.Horizon(time, observer, moonEquator.ra, moonEquator.dec, "normal");
    const illumination = Astronomy.Illumination(Astronomy.Body.Moon, time);
    const phaseAngle = illumination.phase_angle;
    const phaseFraction = illumination.phase_fraction;
    const subSolar = Astronomy.SearchHourAngle(Astronomy.Body.Sun, observer, 0, time);
    const sunGeo = Astronomy.GeoVector(Astronomy.Body.Sun, time, true);
    const subSolarLat = Math.asin(sunGeo.z / sunGeo.Length()) * 180 / Math.PI;
    const moonGeo = Astronomy.GeoVector(Astronomy.Body.Moon, time, true);
    const subLunarLat = Math.asin(moonGeo.z / moonGeo.Length()) * 180 / Math.PI;
    res.json({
      time: date.toISOString(),
      observer: { latitude: lat, longitude: lon },
      sun: {
        azimuth: sunHoriz.azimuth,
        altitude: sunHoriz.altitude,
        ra: sunEquator.ra,
        dec: sunEquator.dec,
        distKm: sunEquator.dist * 1495978707e-1
      },
      moon: {
        azimuth: moonHoriz.azimuth,
        altitude: moonHoriz.altitude,
        ra: moonEquator.ra,
        dec: moonEquator.dec,
        distKm: moonEquator.dist * 1495978707e-1,
        phaseAngle,
        phaseFraction,
        illuminationPct: Math.round(phaseFraction * 100)
      },
      subSolar: { latitude: subSolarLat },
      subLunar: { latitude: subLunarLat }
    });
  } catch (err) {
    const message = typeof err === "string" ? err : err?.message || "Erro desconhecido no c\xE1lculo astron\xF4mico.";
    res.status(500).json({ error: message });
  }
});
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[LunaSolar] Servidor rodando na porta ${PORT}`);
  });
}
start();
//# sourceMappingURL=server.cjs.map
