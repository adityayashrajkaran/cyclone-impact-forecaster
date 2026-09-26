export interface TrackPoint {
  id: string;
  timestamp: string;
  lat: number;
  lng: number;
  max_wind_kmh: number;
  central_pressure_hpa: number;
  category: string;
  storm_surge_est_m: number;
  radius_max_wind_km?: number;
  translation_speed_kmh?: number;
}

export interface CycloneTrack {
  id: string;
  name: string;
  basin: string;
  landfall_target: string;
  status: string;
  current_category: string;
  points: TrackPoint[];
}

export interface SurgeGridCell {
  lat: number;
  lng: number;
  elevation_m: number;
  surge_depth_m: number;
  risk_level: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface SurgeSimulationResponse {
  peak_surge_m: number;
  barometric_component_m: number;
  wind_component_m: number;
  tide_component_m: number;
  landfall_lat: number;
  landfall_lng: number;
  max_wind_kmh: number;
  grid: SurgeGridCell[];
}

export interface InfrastructureAsset {
  id: string;
  name: string;
  asset_type: 'Power Substation' | 'Hospital / Shelter' | 'Arterial Bridge' | 'Port Facility' | 'Telecom Tower';
  lat: number;
  lng: number;
  elevation_m: number;
  district: string;
  population_served: number;
  criticality: 'Extreme' | 'High' | 'Medium';
}

export interface AssetVulnerabilityReport {
  asset: InfrastructureAsset;
  estimated_wind_kmh: number;
  estimated_surge_m: number;
  inundation_risk: 'Severe Inundation' | 'Moderate Flooding' | 'Wind Hazard Only' | 'Safe';
  damage_score_percent: number;
  recommended_action: string;
  estimated_repair_cost_usd: number;
}

export interface ExposureResponse {
  peak_surge_m: number;
  total_infrastructure_evaluated: number;
  severe_inundation_count: number;
  total_repair_cost_estimate_usd: number;
  vulnerability_reports: AssetVulnerabilityReport[];
}

export interface AdvisoryRequest {
  cyclone_name: string;
  target_district: string;
  landfall_eta_hours: number;
  max_wind_speed: number;
  predicted_surge_m: number;
  impacted_infra_count: number;
  language: string;
  api_key?: string;
}

export interface AdvisoryResponse {
  title: string;
  district: string;
  severity_badge: string;
  summary: string;
  evacuation_zone_instructions: string[];
  infrastructure_hardening_priorities: string[];
  resource_allocation_plan: string[];
  public_broadcast_alert: string;
  generated_at: string;
}

export interface ParametricTrigger {
  id: string;
  zone_name: string;
  district: string;
  beneficiary_authority: string;
  payout_tier_usd: number;
  wind_threshold_kmh: number;
  surge_threshold_m: number;
  current_max_wind_kmh: number;
  current_max_surge_m: number;
  status: 'TRIGGERED' | 'MONITORING' | 'STANDBY';
  liquidity_dispatched: boolean;
  trigger_timestamp: string | null;
}
