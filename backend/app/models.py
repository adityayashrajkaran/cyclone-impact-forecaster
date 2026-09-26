from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class TrackPoint(BaseModel):
    id: str
    timestamp: str  # ISO string or formatted date
    lat: float
    lng: float
    max_wind_kmh: float
    central_pressure_hpa: float
    category: str  # e.g., "Depression", "CS", "SCS", "VSCS", "ESCS", "SuCS"
    storm_surge_est_m: float
    radius_max_wind_km: float = 45.0
    translation_speed_kmh: float = 18.0

class CycloneTrack(BaseModel):
    id: str
    name: str
    basin: str = "Bay of Bengal"
    landfall_target: str
    status: str  # "Active", "Forecast", "Historical"
    current_category: str
    points: List[TrackPoint]

class SurgeSimulationRequest(BaseModel):
    track_id: Optional[str] = None
    custom_points: Optional[List[TrackPoint]] = None
    tidal_phase_offset_m: float = 0.8
    bathymetry_slope: float = 0.001  # Shallow shelf increases surge in Bay of Bengal
    coastal_elevation_threshold_m: float = 5.0

class SurgeGridCell(BaseModel):
    lat: float
    lng: float
    elevation_m: float
    surge_depth_m: float
    risk_level: str  # "Critical", "High", "Medium", "Low"

class InfrastructureAsset(BaseModel):
    id: str
    name: str
    asset_type: str  # "Power Substation", "Hospital / Shelter", "Arterial Bridge", "Port Facility", "Telecom Tower"
    lat: float
    lng: float
    elevation_m: float
    district: str
    population_served: int
    criticality: str  # "Extreme", "High", "Medium"

class AssetVulnerabilityReport(BaseModel):
    asset: InfrastructureAsset
    estimated_wind_kmh: float
    estimated_surge_m: float
    inundation_risk: str  # "Severe Inundation", "Moderate Flooding", "Wind Hazard Only", "Safe"
    damage_score_percent: float
    recommended_action: str
    estimated_repair_cost_usd: float

class AdvisoryRequest(BaseModel):
    cyclone_name: str
    target_district: str
    landfall_eta_hours: float
    max_wind_speed: float
    predicted_surge_m: float
    impacted_infra_count: int
    language: str = "English"  # "English", "Bengali", "Odia", "Hindi"
    api_key: Optional[str] = None

class AdvisoryResponse(BaseModel):
    title: str
    district: str
    severity_badge: str
    summary: str
    evacuation_zone_instructions: List[str]
    infrastructure_hardening_priorities: List[str]
    resource_allocation_plan: List[str]
    public_broadcast_alert: str
    generated_at: str

class ParametricTrigger(BaseModel):
    id: str
    zone_name: str
    district: str
    beneficiary_authority: str
    payout_tier_usd: float
    wind_threshold_kmh: float
    surge_threshold_m: float
    current_max_wind_kmh: float
    current_max_surge_m: float
    status: str  # "TRIGGERED", "MONITORING", "STANDBY"
    liquidity_dispatched: bool
    trigger_timestamp: Optional[str] = None
