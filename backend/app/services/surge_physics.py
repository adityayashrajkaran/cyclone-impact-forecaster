import math
import numpy as np
from typing import List, Dict, Any
from app.models import TrackPoint, SurgeGridCell, InfrastructureAsset, AssetVulnerabilityReport

# Realistic Bay of Bengal coastal region bounding box for modeling
BAY_OF_BENGAL_COASTAL_BOUNDS = {
    "min_lat": 19.0,
    "max_lat": 23.5,
    "min_lng": 85.0,
    "max_lng": 91.5
}

def calculate_barometric_surge(central_pressure_hpa: float, ambient_pressure_hpa: float = 1013.25) -> float:
    """Hydrostatic pressure deficit contribution to surge (approx 1cm per 1hPa deficit)"""
    deficit = max(0.0, ambient_pressure_hpa - central_pressure_hpa)
    return deficit * 0.01  # meters

def calculate_wind_surge_peak(max_wind_kmh: float, bathymetry_slope: float = 0.001) -> float:
    """Wind stress surge over shallow Bay of Bengal continental shelf"""
    wind_ms = max_wind_kmh / 3.6
    # Shallow bathymetry coefficient (Bay of Bengal is notorious for severe surge due to shallow head of bay)
    shelf_factor = 0.00035 / max(0.0003, bathymetry_slope)
    surge_wind = shelf_factor * (wind_ms ** 2) / 9.81
    return min(max(0.5, surge_wind), 9.5)  # Cap surge to realistic max 9.5m

def generate_surge_grid(track_points: List[TrackPoint], tidal_phase_m: float = 0.8, bathymetry_slope: float = 0.001) -> Dict[str, Any]:
    """Generates 2D storm surge elevation and inundation grid around cyclone track landfall"""
    if not track_points:
        return {"grid": [], "peak_surge_m": 0.0, "landfall_point": None}

    # Find landfall point (point closest to coastline ~20.5-22.5 N)
    landfall = track_points[-1]
    for pt in track_points:
        if 20.0 <= pt.lat <= 22.8 and 86.0 <= pt.lng <= 90.5:
            landfall = pt
            break

    p_surge = calculate_barometric_surge(landfall.central_pressure_hpa)
    w_surge = calculate_wind_surge_peak(landfall.max_wind_kmh, bathymetry_slope)
    peak_surge_m = round(p_surge + w_surge + tidal_phase_m, 2)

    # Generate spatial grid points along coastal districts (Odisha, Sundarbans, Chattogram)
    grid_cells: List[SurgeGridCell] = []
    
    # Grid resolution
    lats = np.linspace(landfall.lat - 1.2, landfall.lat + 1.2, 25)
    lngs = np.linspace(landfall.lng - 1.5, landfall.lng + 1.5, 25)

    for lat in lats:
        for lng in lngs:
            # Distance to landfall center in km
            dist_km = math.sqrt(((lat - landfall.lat) * 111)**2 + ((lng - landfall.lng) * 102)**2)
            
            # Distance to coastline simulation (coastal proximity factor)
            is_coastal = (lat >= 19.8 and lat <= 22.5) and (85.5 <= lng <= 90.5)
            
            if not is_coastal:
                continue

            # Simplified elevation model (coastal flatlands 1-12m elevation)
            elevation_m = max(0.5, round(2.0 + (lat - 20.0) * 1.5 + abs(lng - 88.0) * 1.2, 1))

            # Decay function from storm eye
            rmw = landfall.radius_max_wind_km
            surge_decay = math.exp(-0.5 * ((dist_km / rmw) ** 1.8))
            
            cell_surge = max(0.0, round(peak_surge_m * surge_decay - elevation_m, 2))
            
            if cell_surge > 3.0:
                risk = "Critical"
            elif cell_surge > 1.5:
                risk = "High"
            elif cell_surge > 0.3:
                risk = "Medium"
            else:
                risk = "Low"

            grid_cells.append(SurgeGridCell(
                lat=round(float(lat), 4),
                lng=round(float(lng), 4),
                elevation_m=elevation_m,
                surge_depth_m=cell_surge,
                risk_level=risk
            ))

    return {
        "peak_surge_m": peak_surge_m,
        "barometric_component_m": round(p_surge, 2),
        "wind_component_m": round(w_surge, 2),
        "tide_component_m": tidal_phase_m,
        "landfall_lat": landfall.lat,
        "landfall_lng": landfall.lng,
        "max_wind_kmh": landfall.max_wind_kmh,
        "grid": grid_cells
    }
