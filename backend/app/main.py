import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional

from app.models import (
    CycloneTrack, TrackPoint, SurgeSimulationRequest,
    AdvisoryRequest, AdvisoryResponse, ParametricTrigger
)
from app.services.surge_physics import generate_surge_grid
from app.services.exposure_engine import evaluate_infrastructure_vulnerability, SAMPLE_INFRASTRUCTURE
from app.services.gee_connector import get_earth_engine_layers
from app.services.gemini_service import generate_cyclone_advisory
from app.services.parametric_insurance import evaluate_parametric_triggers

app = FastAPI(
    title="ResiliTrack Cyclone AI Engine",
    description="Track-Based Cyclone Impact & Infrastructure Vulnerability Forecasting Platform",
    version="1.0.0"
)

# Enable CORS for Vite frontend development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample Cyclone Tracks (Bay of Bengal focus)
PRESET_CYCLONES: List[CycloneTrack] = [
    CycloneTrack(
        id="CY-REMAL-2024",
        name="Severe Cyclone Remal",
        basin="Bay of Bengal",
        landfall_target="Kolkata / Sundarbans Coastal Belt",
        status="Historical Benchmark",
        current_category="VSCS (Very Severe Cyclonic Storm)",
        points=[
            TrackPoint(id="p1", timestamp="2024-05-24 12:00 UTC", lat=16.50, lng=88.20, max_wind_kmh=65, central_pressure_hpa=998, category="Deep Depression", storm_surge_est_m=0.5),
            TrackPoint(id="p2", timestamp="2024-05-25 06:00 UTC", lat=18.20, lng=88.60, max_wind_kmh=90, central_pressure_hpa=990, category="Cyclonic Storm", storm_surge_est_m=1.2),
            TrackPoint(id="p3", timestamp="2024-05-25 18:00 UTC", lat=19.80, lng=88.90, max_wind_kmh=115, central_pressure_hpa=982, category="Severe Cyclonic Storm", storm_surge_est_m=2.1),
            TrackPoint(id="p4", timestamp="2024-05-26 06:00 UTC", lat=21.10, lng=89.20, max_wind_kmh=135, central_pressure_hpa=974, category="VSCS", storm_surge_est_m=3.2),
            TrackPoint(id="p5", timestamp="2024-05-26 18:00 UTC (Landfall)", lat=22.00, lng=89.30, max_wind_kmh=140, central_pressure_hpa=970, category="VSCS Landfall", storm_surge_est_m=3.8)
        ]
    ),
    CycloneTrack(
        id="CY-DANA-2024",
        name="Severe Cyclone Dana",
        basin="Bay of Bengal",
        landfall_target="Dhamra / Paradeep Coast (Odisha)",
        status="Active Threat Simulation",
        current_category="SCS (Severe Cyclonic Storm)",
        points=[
            TrackPoint(id="dp1", timestamp="2024-10-23 06:00 UTC", lat=16.00, lng=89.50, max_wind_kmh=75, central_pressure_hpa=994, category="Cyclonic Storm", storm_surge_est_m=0.8),
            TrackPoint(id="dp2", timestamp="2024-10-23 18:00 UTC", lat=17.50, lng=88.10, max_wind_kmh=100, central_pressure_hpa=988, category="Severe Cyclonic Storm", storm_surge_est_m=1.6),
            TrackPoint(id="dp3", timestamp="2024-10-24 06:00 UTC", lat=19.10, lng=87.40, max_wind_kmh=120, central_pressure_hpa=980, category="SCS", storm_surge_est_m=2.4),
            TrackPoint(id="dp4", timestamp="2024-10-24 18:00 UTC", lat=20.30, lng=86.90, max_wind_kmh=130, central_pressure_hpa=976, category="SCS Near Landfall", storm_surge_est_m=2.9),
            TrackPoint(id="dp5", timestamp="2024-10-25 00:00 UTC (Landfall)", lat=20.80, lng=86.85, max_wind_kmh=135, central_pressure_hpa=972, category="Landfall (Dhamra)", storm_surge_est_m=3.4)
        ]
    ),
    CycloneTrack(
        id="CY-AMPHAN-2020",
        name="Super Cyclone Amphan",
        basin="Bay of Bengal",
        landfall_target="West Bengal & Bangladesh Polders",
        status="Extreme Category Benchmark",
        current_category="SuCS (Super Cyclonic Storm)",
        points=[
            TrackPoint(id="ap1", timestamp="2020-05-18 00:00 UTC", lat=13.40, lng=86.20, max_wind_kmh=180, central_pressure_hpa=950, category="Extremely Severe CS", storm_surge_est_m=2.5),
            TrackPoint(id="ap2", timestamp="2020-05-18 18:00 UTC", lat=15.60, lng=86.50, max_wind_kmh=240, central_pressure_hpa=920, category="Super Cyclone", storm_surge_est_m=4.8),
            TrackPoint(id="ap3", timestamp="2020-05-19 12:00 UTC", lat=18.00, lng=87.00, max_wind_kmh=210, central_pressure_hpa=935, category="SuCS", storm_surge_est_m=4.2),
            TrackPoint(id="ap4", timestamp="2020-05-20 06:00 UTC", lat=20.50, lng=88.00, max_wind_kmh=175, central_pressure_hpa=950, category="VSCS", storm_surge_est_m=4.5),
            TrackPoint(id="ap5", timestamp="2020-05-20 12:00 UTC (Landfall)", lat=21.70, lng=88.30, max_wind_kmh=165, central_pressure_hpa=956, category="Landfall (Digha-Hatiya)", storm_surge_est_m=5.2)
        ]
    )
]

@app.get("/")
def read_root():
    return {"status": "online", "system": "ResiliTrack Cyclone AI API Engine", "gee_connected": True}

@app.get("/api/cyclones", response_model=List[CycloneTrack])
def get_cyclone_tracks():
    return PRESET_CYCLONES

@app.get("/api/cyclones/{cyclone_id}", response_model=CycloneTrack)
def get_cyclone_by_id(cyclone_id: str):
    for cy in PRESET_CYCLONES:
        if cy.id == cyclone_id:
            return cy
    raise HTTPException(status_code=404, detail="Cyclone track not found")

@app.post("/api/simulate-surge")
def simulate_surge(req: SurgeSimulationRequest):
    track_points = req.custom_points
    if not track_points and req.track_id:
        for cy in PRESET_CYCLONES:
            if cy.id == req.track_id:
                track_points = cy.points
                break
    
    if not track_points:
        track_points = PRESET_CYCLONES[0].points

    surge_result = generate_surge_grid(
        track_points,
        tidal_phase_m=req.tidal_phase_offset_m,
        bathymetry_slope=req.bathymetry_slope
    )
    return surge_result

@app.post("/api/exposure")
def evaluate_exposure(req: SurgeSimulationRequest):
    track_points = req.custom_points
    if not track_points and req.track_id:
        for cy in PRESET_CYCLONES:
            if cy.id == req.track_id:
                track_points = cy.points
                break

    if not track_points:
        track_points = PRESET_CYCLONES[0].points

    surge_result = generate_surge_grid(track_points, tidal_phase_m=req.tidal_phase_offset_m)
    vulnerabilities = evaluate_infrastructure_vulnerability(track_points, surge_result["peak_surge_m"])
    
    total_cost = sum(v.estimated_repair_cost_usd for v in vulnerabilities)
    critical_count = sum(1 for v in vulnerabilities if v.inundation_risk == "Severe Inundation")

    return {
        "peak_surge_m": surge_result["peak_surge_m"],
        "total_infrastructure_evaluated": len(vulnerabilities),
        "severe_inundation_count": critical_count,
        "total_repair_cost_estimate_usd": total_cost,
        "vulnerability_reports": vulnerabilities
    }

@app.get("/api/gee-layers")
def get_gee_metadata(lat: float = 20.803, lng: float = 86.960):
    return get_earth_engine_layers(lat, lng)

@app.post("/api/gemini-advisory", response_model=AdvisoryResponse)
def get_advisory(req: AdvisoryRequest):
    return generate_cyclone_advisory(req)

@app.post("/api/parametric-triggers", response_model=List[ParametricTrigger])
def get_parametric_triggers(max_wind_kmh: float = 135.0, peak_surge_m: float = 3.2):
    return evaluate_parametric_triggers(max_wind_kmh, peak_surge_m)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
