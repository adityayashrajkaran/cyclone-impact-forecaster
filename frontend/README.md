# ResiliTrack Cyclone AI

**Bay of Bengal & Coastal APAC Cyclone Impact & Infrastructure Vulnerability Forecaster**

ResiliTrack is a full-stack disaster-response simulation platform that models tropical cyclone tracks in the Bay of Bengal, projects storm surge inundation using physics-based hydrodynamics, evaluates critical infrastructure exposure, and generates AI-powered emergency advisory bulletins — all in one interactive dashboard.

---

## ✨ Features

- 🌪️ **Spatial GIS & Surge Model** — Interactive Leaflet map with live cyclone track visualization, landfall wind buffers, and a dynamic storm-surge inundation grid.
- 🏗️ **Infrastructure Risk Table** — Vulnerability scoring for power substations, hospitals, bridges, ports, and telecom towers against projected surge depth and wind speed.
- 📋 **EOC Advisory Bulletin** — AI-generated (Gemini) early-warning bulletins with evacuation mandates, infrastructure hardening priorities, and resource allocation plans — exportable as PDF and readable via text-to-speech.
- 💰 **Parametric Insurance Dashboard** — Simulated index-based insurance triggers that release pre-landfall liquidity when wind/surge thresholds are breached.
- 🛰️ **Earth Observation Feeds** — Copernicus DEM elevation, Sentinel-1 SAR flood detection, and Bay of Bengal sea-surface temperature anomalies.
- 🧮 **Adjustable Storm Hydrodynamics** — Tune central pressure deficit, max sustained wind, astronomical tide offset, and continental shelf bathymetry to re-run the surge simulation live.

---

## 🧱 Tech Stack

**Frontend**
- React 19 + TypeScript + Vite
- Tailwind CSS 4
- React-Leaflet / Leaflet (interactive mapping)
- Recharts (data visualization)
- jsPDF + jspdf-autotable (PDF export)
- Lucide React (icons)

**Backend**
- FastAPI (Python)
- Pydantic v2 (data validation)
- NumPy / SciPy (surge physics calculations)
- Google Gen AI SDK (Gemini advisory generation)
- Google Earth Engine / Copernicus data connectors

---

## 📁 Project Structure

```
cyclone-impact-forecaster/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app & route definitions
│   │   ├── models.py               # Pydantic request/response models
│   │   └── services/
│   │       ├── surge_physics.py        # Storm surge hydrodynamics engine
│   │       ├── exposure_engine.py      # Infrastructure vulnerability scoring
│   │       ├── gee_connector.py        # Earth observation data connector
│   │       ├── gemini_service.py       # AI advisory bulletin generation
│   │       └── parametric_insurance.py # Parametric trigger evaluation
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Map/CycloneMap.tsx
    │   │   ├── TrackSimulator/TrackControls.tsx
    │   │   ├── Infrastructure/VulnerabilityTable.tsx
    │   │   ├── Advisory/GeminiAdvisoryPanel.tsx
    │   │   ├── Parametric/ParametricDashboard.tsx
    │   │   └── GEE/GEEDataPanel.tsx
    │   ├── services/api.ts         # Backend API client + offline fallback data
    │   └── types/index.ts          # Shared TypeScript interfaces
    ├── package.json
    └── .env.example
```

---

