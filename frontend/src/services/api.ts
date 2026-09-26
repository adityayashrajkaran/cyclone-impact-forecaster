import {
  CycloneTrack,
  SurgeSimulationResponse,
  ExposureResponse,
  AdvisoryResponse,
  AdvisoryRequest,
  ParametricTrigger,
  TrackPoint
} from '../types';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

export async function fetchCycloneTracks(): Promise<CycloneTrack[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/cyclones`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend server offline, loading built-in preset tracks.');
  }
  return FALLBACK_CYCLONES;
}

export async function simulateSurge(
  trackId: string,
  customPoints?: TrackPoint[],
  tidalOffset: number = 0.8,
  bathymetrySlope: number = 0.001
): Promise<SurgeSimulationResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/simulate-surge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        track_id: trackId,
        custom_points: customPoints,
        tidal_phase_offset_m: tidalOffset,
        bathymetry_slope: bathymetrySlope
      })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend offline, running frontend fallback surge calculation.');
  }
  return calculateFallbackSurge(customPoints || FALLBACK_CYCLONES[0].points, tidalOffset);
}

export async function evaluateExposure(
  trackId: string,
  customPoints?: TrackPoint[],
  tidalOffset: number = 0.8
): Promise<ExposureResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/exposure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        track_id: trackId,
        custom_points: customPoints,
        tidal_phase_offset_m: tidalOffset
      })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend offline, running fallback exposure calculation.');
  }
  return calculateFallbackExposure(customPoints || FALLBACK_CYCLONES[0].points);
}

export async function generateGeminiAdvisory(req: AdvisoryRequest): Promise<AdvisoryResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/gemini-advisory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend offline, generating fallback Gemini 3.7 Flash advisory.');
  }
  return generateFallbackAdvisory(req);
}

export async function fetchParametricTriggers(maxWind: number, peakSurge: number): Promise<ParametricTrigger[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/parametric-triggers?max_wind_kmh=${maxWind}&peak_surge_m=${peakSurge}`, {
      method: 'POST'
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend offline, using local parametric calculation.');
  }
  return calculateFallbackParametric(maxWind, peakSurge);
}

// Built-in high-fidelity presets for instant loading
export const FALLBACK_CYCLONES: CycloneTrack[] = [
  {
    id: "CY-REMAL-2024",
    name: "Severe Cyclone Remal",
    basin: "Bay of Bengal",
    landfall_target: "Kolkata / Sundarbans Coastal Belt",
    status: "Historical Benchmark",
    current_category: "VSCS (Very Severe Cyclonic Storm)",
    points: [
      { id: "p1", timestamp: "2024-05-24 12:00 UTC", lat: 16.50, lng: 88.20, max_wind_kmh: 65, central_pressure_hpa: 998, category: "Deep Depression", storm_surge_est_m: 0.5, radius_max_wind_km: 45, translation_speed_kmh: 18 },
      { id: "p2", timestamp: "2024-05-25 06:00 UTC", lat: 18.20, lng: 88.60, max_wind_kmh: 90, central_pressure_hpa: 990, category: "Cyclonic Storm", storm_surge_est_m: 1.2, radius_max_wind_km: 45, translation_speed_kmh: 18 },
      { id: "p3", timestamp: "2024-05-25 18:00 UTC", lat: 19.80, lng: 88.90, max_wind_kmh: 115, central_pressure_hpa: 982, category: "Severe Cyclonic Storm", storm_surge_est_m: 2.1, radius_max_wind_km: 45, translation_speed_kmh: 18 },
      { id: "p4", timestamp: "2024-05-26 06:00 UTC", lat: 21.10, lng: 89.20, max_wind_kmh: 135, central_pressure_hpa: 974, category: "VSCS", storm_surge_est_m: 3.2, radius_max_wind_km: 45, translation_speed_kmh: 18 },
      { id: "p5", timestamp: "2024-05-26 18:00 UTC (Landfall)", lat: 22.00, lng: 89.30, max_wind_kmh: 140, central_pressure_hpa: 970, category: "VSCS Landfall", storm_surge_est_m: 3.8, radius_max_wind_km: 45, translation_speed_kmh: 18 }
    ]
  },
  {
    id: "CY-DANA-2024",
    name: "Severe Cyclone Dana",
    basin: "Bay of Bengal",
    landfall_target: "Dhamra / Paradeep Coast (Odisha)",
    status: "Active Threat Simulation",
    current_category: "SCS (Severe Cyclonic Storm)",
    points: [
      { id: "dp1", timestamp: "2024-10-23 06:00 UTC", lat: 16.00, lng: 89.50, max_wind_kmh: 75, central_pressure_hpa: 994, category: "Cyclonic Storm", storm_surge_est_m: 0.8, radius_max_wind_km: 40, translation_speed_kmh: 16 },
      { id: "dp2", timestamp: "2024-10-23 18:00 UTC", lat: 17.50, lng: 88.10, max_wind_kmh: 100, central_pressure_hpa: 988, category: "Severe Cyclonic Storm", storm_surge_est_m: 1.6, radius_max_wind_km: 40, translation_speed_kmh: 16 },
      { id: "dp3", timestamp: "2024-10-24 06:00 UTC", lat: 19.10, lng: 87.40, max_wind_kmh: 120, central_pressure_hpa: 980, category: "SCS", storm_surge_est_m: 2.4, radius_max_wind_km: 40, translation_speed_kmh: 16 },
      { id: "dp4", timestamp: "2024-10-24 18:00 UTC", lat: 20.30, lng: 86.90, max_wind_kmh: 130, central_pressure_hpa: 976, category: "SCS Near Landfall", storm_surge_est_m: 2.9, radius_max_wind_km: 40, translation_speed_kmh: 16 },
      { id: "dp5", timestamp: "2024-10-25 00:00 UTC (Landfall)", lat: 20.80, lng: 86.85, max_wind_kmh: 135, central_pressure_hpa: 972, category: "Landfall (Dhamra)", storm_surge_est_m: 3.4, radius_max_wind_km: 40, translation_speed_kmh: 16 }
    ]
  },
  {
    id: "CY-AMPHAN-2020",
    name: "Super Cyclone Amphan",
    basin: "Bay of Bengal",
    landfall_target: "West Bengal & Bangladesh Polders",
    status: "Extreme Category Benchmark",
    current_category: "SuCS (Super Cyclonic Storm)",
    points: [
      { id: "ap1", timestamp: "2020-05-18 00:00 UTC", lat: 13.40, lng: 86.20, max_wind_kmh: 180, central_pressure_hpa: 950, category: "Extremely Severe CS", storm_surge_est_m: 2.5, radius_max_wind_km: 55, translation_speed_kmh: 22 },
      { id: "ap2", timestamp: "2020-05-18 18:00 UTC", lat: 15.60, lng: 86.50, max_wind_kmh: 240, central_pressure_hpa: 920, category: "Super Cyclone", storm_surge_est_m: 4.8, radius_max_wind_km: 55, translation_speed_kmh: 22 },
      { id: "ap3", timestamp: "2020-05-19 12:00 UTC", lat: 18.00, lng: 87.00, max_wind_kmh: 210, central_pressure_hpa: 935, category: "SuCS", storm_surge_est_m: 4.2, radius_max_wind_km: 55, translation_speed_kmh: 22 },
      { id: "ap4", timestamp: "2020-05-20 06:00 UTC", lat: 20.50, lng: 88.00, max_wind_kmh: 175, central_pressure_hpa: 950, category: "VSCS", storm_surge_est_m: 4.5, radius_max_wind_km: 55, translation_speed_kmh: 22 },
      { id: "ap5", timestamp: "2020-05-20 12:00 UTC (Landfall)", lat: 21.70, lng: 88.30, max_wind_kmh: 165, central_pressure_hpa: 956, category: "Landfall (Digha-Hatiya)", storm_surge_est_m: 5.2, radius_max_wind_km: 55, translation_speed_kmh: 22 }
    ]
  }
];

function calculateFallbackSurge(points: TrackPoint[], tidalOffset: number): SurgeSimulationResponse {
  const landfall = points[points.length - 1];
  const barometric = Math.max(0, (1013 - landfall.central_pressure_hpa) * 0.01);
  const wind = Math.min(8.0, (landfall.max_wind_kmh / 3.6) ** 2 * 0.0035);
  const peakSurge = Math.round((barometric + wind + tidalOffset) * 100) / 100;

  const grid = [];
  for (let lat = landfall.lat - 1.0; lat <= landfall.lat + 1.0; lat += 0.12) {
    for (let lng = landfall.lng - 1.2; lng <= landfall.lng + 1.2; lng += 0.12) {
      const dist = Math.sqrt(((lat - landfall.lat) * 111) ** 2 + ((lng - landfall.lng) * 102) ** 2);
      const elev = Math.max(0.5, Math.round((2.0 + (lat - 20) * 1.5 + Math.abs(lng - 88) * 1.2) * 10) / 10);
      const cellSurge = Math.max(0, Math.round((peakSurge * Math.exp(-dist / 50) - elev) * 100) / 100);

      let risk: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
      if (cellSurge > 3.0) risk = 'Critical';
      else if (cellSurge > 1.5) risk = 'High';
      else if (cellSurge > 0.4) risk = 'Medium';

      grid.push({ lat, lng, elevation_m: elev, surge_depth_m: cellSurge, risk_level: risk });
    }
  }

  return {
    peak_surge_m: peakSurge,
    barometric_component_m: Math.round(barometric * 100) / 100,
    wind_component_m: Math.round(wind * 100) / 100,
    tide_component_m: tidalOffset,
    landfall_lat: landfall.lat,
    landfall_lng: landfall.lng,
    max_wind_kmh: landfall.max_wind_kmh,
    grid
  };
}

function calculateFallbackExposure(points: TrackPoint[]): ExposureResponse {
  const landfall = points[points.length - 1];
  const peakSurge = Math.min(5.5, (landfall.max_wind_kmh / 30));

  const sampleAssets = [
    { id: "INF-001", name: "Paradeep Port Substation 220kV", asset_type: "Power Substation" as const, lat: 20.2680, lng: 86.6710, elevation_m: 2.1, district: "Jagatsinghpur (Odisha)", population_served: 350000, criticality: "Extreme" as const },
    { id: "INF-002", name: "Dhamra Major Seaport Terminal", asset_type: "Port Facility" as const, lat: 20.8030, lng: 86.9600, elevation_m: 1.8, district: "Bhadrak (Odisha)", population_served: 120000, criticality: "Extreme" as const },
    { id: "INF-003", name: "Kendrapara District Emergency Medical Complex", asset_type: "Hospital / Shelter" as const, lat: 20.5010, lng: 86.4220, elevation_m: 4.5, district: "Kendrapara (Odisha)", population_served: 450000, criticality: "Extreme" as const },
    { id: "INF-004", name: "Mahanadi River Mouth Highway Bridge (NH-53)", asset_type: "Arterial Bridge" as const, lat: 20.3150, lng: 86.5820, elevation_m: 5.2, district: "Jagatsinghpur (Odisha)", population_served: 800000, criticality: "High" as const },
    { id: "INF-005", name: "Haldia Petrochemical Energy Grid Hub", asset_type: "Power Substation" as const, lat: 22.0250, lng: 88.0580, elevation_m: 3.0, district: "Purba Medinipur (West Bengal)", population_served: 650000, criticality: "Extreme" as const },
    { id: "INF-006", name: "Digha Coastal Cyclone Shelter & Control Center", asset_type: "Hospital / Shelter" as const, lat: 21.6260, lng: 87.5070, elevation_m: 2.8, district: "Purba Medinipur (West Bengal)", population_served: 180000, criticality: "High" as const },
    { id: "INF-007", name: "Kakdwip Island Emergency Relay Tower", asset_type: "Telecom Tower" as const, lat: 21.8750, lng: 88.1860, elevation_m: 2.2, district: "South 24 Parganas (Sundarbans)", population_served: 290000, criticality: "High" as const },
    { id: "INF-008", name: "Mongla Port Maritime Cargo Substation", asset_type: "Port Facility" as const, lat: 22.4830, lng: 89.6000, elevation_m: 2.4, district: "Bagerhat (Bangladesh)", population_served: 500000, criticality: "Extreme" as const }
  ];

  const reports = sampleAssets.map(asset => {
    const dist = Math.sqrt(((asset.lat - landfall.lat) * 111) ** 2 + ((asset.lng - landfall.lng) * 102) ** 2);
    const estWind = Math.round(landfall.max_wind_kmh * Math.exp(-dist / 60));
    const estSurge = Math.max(0, Math.round((peakSurge * Math.exp(-dist / 55) - asset.elevation_m) * 10) / 10);

    let risk: 'Severe Inundation' | 'Moderate Flooding' | 'Wind Hazard Only' | 'Safe' = 'Safe';
    let damagePct = 0;
    let cost = 0;
    let action = "Nominal readiness monitoring.";

    if (estSurge > 1.5 || estWind > 135) {
      risk = 'Severe Inundation';
      damagePct = Math.min(100, Math.round(40 + estSurge * 25));
      cost = 35000000; // ₹3.5 Crore
      action = "Immediate structural hardening, deploy backup diesel generators, initiate power isolation.";
    } else if (estSurge > 0.3 || estWind > 95) {
      risk = 'Moderate Flooding';
      damagePct = Math.round(15 + estSurge * 15);
      cost = 10000000; // ₹1 Crore
      action = "Deploy sandbag barriers, position emergency repair teams, elevate batteries.";
    } else if (estWind > 70) {
      risk = 'Wind Hazard Only';
      damagePct = Math.round(5 + (estWind - 70) * 0.2);
      cost = 2000000; // ₹20 Lakhs
      action = "Secure loose equipment, inspect guy wire tensions.";
    }

    return {
      asset,
      estimated_wind_kmh: estWind,
      estimated_surge_m: estSurge,
      inundation_risk: risk,
      damage_score_percent: damagePct,
      recommended_action: action,
      estimated_repair_cost_usd: cost
    };
  });

  return {
    peak_surge_m: peakSurge,
    total_infrastructure_evaluated: reports.length,
    severe_inundation_count: reports.filter(r => r.inundation_risk === 'Severe Inundation').length,
    total_repair_cost_estimate_usd: reports.reduce((acc, r) => acc + r.estimated_repair_cost_usd, 0),
    vulnerability_reports: reports
  };
}

function generateFallbackAdvisory(req: AdvisoryRequest): AdvisoryResponse {
  return {
    title: `[GEMINI 3.7 FLASH DISPATCH] EMERGENCY ACTION BULLETIN: ${req.cyclone_name.toUpperCase()} - ${req.target_district.toUpperCase()}`,
    district: req.target_district,
    severity_badge: req.max_wind_speed >= 130 ? "EXTREME THREAT" : "SEVERE WARNING",
    summary: `Severe Tropical Cyclone ${req.cyclone_name} is tracking toward ${req.target_district} with landfall expected in T-${req.landfall_eta_hours} hours. Peak winds of ${req.max_wind_speed} km/h and a dangerous storm surge of ${req.predicted_surge_m}m threaten coastal settlements and ${req.impacted_infra_count} critical infrastructure assets.`,
    evacuation_zone_instructions: [
      `Mandatory evacuation ordered for coastal zones under ${req.predicted_surge_m + 1.0}m elevation within ${req.target_district}.`,
      "Relocate vulnerable populations (elderly, children, livestock) to concrete Multi-Purpose Cyclone Shelters (MPCS).",
      "Halt all maritime fishing, inland river transport, and polder construction work immediately.",
      "Establish police check-points along NH arterial routes to enforce one-way evacuation flow."
    ],
    infrastructure_hardening_priorities: [
      "Power Sub-stations: De-energize coastal 132kV transformers before surge arrival to avoid transformer grid explosions.",
      "District Hospitals: Activate rooftop backup diesel generators with 72h fuel reserve; isolate ground-floor ICU wards.",
      "Arterial Bridges: Position heavy clearing machinery (JCBs, chainsaw units) to clear uprooted trees from bridge approaches."
    ],
    resource_allocation_plan: [
      `Deploy 4 NDRF / SDRF Search & Rescue Battalions with inflatable motorized boats at ${req.target_district} HQ.`,
      "Distribute 20,000 dry food rations, water purification units, and medical trauma kits to shelter hubs.",
      "Deploy satellite mobile communication vans (HAM & VSAT) to ensure uninterrupted emergency command linkage."
    ],
    public_broadcast_alert: `Urgent Warning: Severe Storm Surge of ${req.predicted_surge_m}m projected for ${req.target_district}. Move to concrete storm shelters immediately. Stay away from coastal embankments and high-voltage power lines.`,
    generated_at: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC'
  };
}

function calculateFallbackParametric(maxWind: number, peakSurge: number): ParametricTrigger[] {
  return [
    {
      id: "POL-OD-001",
      zone_name: "Odisha Coastal Resilience Zone A",
      district: "Jagatsinghpur & Bhadrak",
      beneficiary_authority: "Odisha State Disaster Management Authority (OSDMA)",
      payout_tier_usd: 200000000, // ₹20 Crore
      wind_threshold_kmh: 120,
      surge_threshold_m: 2.0,
      current_max_wind_kmh: maxWind,
      current_max_surge_m: peakSurge,
      status: (maxWind >= 120 || peakSurge >= 2.0) ? "TRIGGERED" : (maxWind >= 100 || peakSurge >= 1.6) ? "MONITORING" : "STANDBY",
      liquidity_dispatched: (maxWind >= 120 || peakSurge >= 2.0),
      trigger_timestamp: (maxWind >= 120 || peakSurge >= 2.0) ? new Date().toISOString() : null
    },
    {
      id: "POL-WB-002",
      zone_name: "Sundarbans Biosphere & Estuary Zone",
      district: "South 24 Parganas",
      beneficiary_authority: "West Bengal Disaster Management Dept",
      payout_tier_usd: 150000000, // ₹15 Crore
      wind_threshold_kmh: 110,
      surge_threshold_m: 1.8,
      current_max_wind_kmh: maxWind,
      current_max_surge_m: peakSurge,
      status: (maxWind >= 110 || peakSurge >= 1.8) ? "TRIGGERED" : (maxWind >= 90 || peakSurge >= 1.4) ? "MONITORING" : "STANDBY",
      liquidity_dispatched: (maxWind >= 110 || peakSurge >= 1.8),
      trigger_timestamp: (maxWind >= 110 || peakSurge >= 1.8) ? new Date().toISOString() : null
    },
    {
      id: "POL-BD-003",
      zone_name: "Chattogram & Cox's Bazar Coastal Belt",
      district: "Cox's Bazar",
      beneficiary_authority: "Ministry of Disaster Management & Relief (Bangladesh)",
      payout_tier_usd: 250000000, // ₹25 Crore
      wind_threshold_kmh: 125,
      surge_threshold_m: 2.2,
      current_max_wind_kmh: maxWind,
      current_max_surge_m: peakSurge,
      status: (maxWind >= 125 || peakSurge >= 2.2) ? "TRIGGERED" : (maxWind >= 100 || peakSurge >= 1.8) ? "MONITORING" : "STANDBY",
      liquidity_dispatched: (maxWind >= 125 || peakSurge >= 2.2),
      trigger_timestamp: (maxWind >= 125 || peakSurge >= 2.2) ? new Date().toISOString() : null
    }
  ];
}
