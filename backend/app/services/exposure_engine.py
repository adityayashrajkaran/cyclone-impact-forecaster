import math
from typing import List, Dict, Any
from app.models import InfrastructureAsset, AssetVulnerabilityReport, TrackPoint

# Initial dataset of key critical infrastructure along Bay of Bengal coastline
SAMPLE_INFRASTRUCTURE: List[InfrastructureAsset] = [
    InfrastructureAsset(
        id="INF-001",
        name="Paradeep Port Substation 220kV",
        asset_type="Power Substation",
        lat=20.2680,
        lng=86.6710,
        elevation_m=2.1,
        district="Jagatsinghpur (Odisha)",
        population_served=350000,
        criticality="Extreme"
    ),
    InfrastructureAsset(
        id="INF-002",
        name="Dhamra Major Seaport Terminal",
        asset_type="Port Facility",
        lat=20.8030,
        lng=86.9600,
        elevation_m=1.8,
        district="Bhadrak (Odisha)",
        population_served=120000,
        criticality="Extreme"
    ),
    InfrastructureAsset(
        id="INF-003",
        name="Kendrapara District Emergency Medical Complex",
        asset_type="Hospital / Shelter",
        lat=20.5010,
        lng=86.4220,
        elevation_m=4.5,
        district="Kendrapara (Odisha)",
        population_served=450000,
        criticality="Extreme"
    ),
    InfrastructureAsset(
        id="INF-004",
        name="Mahanadi River Mouth Highway Bridge (NH-53)",
        asset_type="Arterial Bridge",
        lat=20.3150,
        lng=86.5820,
        elevation_m=5.2,
        district="Jagatsinghpur (Odisha)",
        population_served=800000,
        criticality="High"
    ),
    InfrastructureAsset(
        id="INF-005",
        name="Haldia Petrochemical Energy Grid Hub",
        asset_type="Power Substation",
        lat=22.0250,
        lng=88.0580,
        elevation_m=3.0,
        district="Purba Medinipur (West Bengal)",
        population_served=650000,
        criticality="Extreme"
    ),
    InfrastructureAsset(
        id="INF-006",
        name="Digha Coastal Cyclone Shelter & Control Center",
        asset_type="Hospital / Shelter",
        lat=21.6260,
        lng=87.5070,
        elevation_m=2.8,
        district="Purba Medinipur (West Bengal)",
        population_served=180000,
        criticality="High"
    ),
    InfrastructureAsset(
        id="INF-007",
        name="Kakdwip Island Emergency Relay Tower",
        asset_type="Telecom Tower",
        lat=21.8750,
        lng=88.1860,
        elevation_m=2.2,
        district="South 24 Parganas (Sundarbans)",
        population_served=290000,
        criticality="High"
    ),
    InfrastructureAsset(
        id="INF-008",
        name="Mongla Port Maritime Cargo Substation",
        asset_type="Port Facility",
        lat=22.4830,
        lng=89.6000,
        elevation_m=2.4,
        district="Bagerhat (Bangladesh)",
        population_served=500000,
        criticality="Extreme"
    ),
    InfrastructureAsset(
        id="INF-009",
        name="Barishal Division Trauma Hospital & Shelter",
        asset_type="Hospital / Shelter",
        lat=22.7010,
        lng=90.3540,
        elevation_m=3.8,
        district="Barishal (Bangladesh)",
        population_served=920000,
        criticality="Extreme"
    ),
    InfrastructureAsset(
        id="INF-010",
        name="Cox's Bazar Coastal Microwave Communications Tower",
        asset_type="Telecom Tower",
        lat=21.4270,
        lng=91.9710,
        elevation_m=4.0,
        district="Cox's Bazar (Bangladesh)",
        population_served=410000,
        criticality="High"
    )
]

def evaluate_infrastructure_vulnerability(track_points: List[TrackPoint], peak_surge_m: float) -> List[AssetVulnerabilityReport]:
    """Calculates wind hazard, surge inundation depth, and fragility damage for each critical asset"""
    reports: List[AssetVulnerabilityReport] = []

    if not track_points:
        return reports

    landfall = track_points[-1]

    for asset in SAMPLE_INFRASTRUCTURE:
        # Distance to storm center at landfall
        dist_km = math.sqrt(((asset.lat - landfall.lat) * 111)**2 + ((asset.lng - landfall.lng) * 102)**2)
        
        # Wind decay with distance
        rmw = landfall.radius_max_wind_km
        wind_ratio = math.exp(-0.5 * ((dist_km / rmw) ** 1.5))
        est_wind_kmh = round(landfall.max_wind_kmh * max(0.2, wind_ratio), 1)

        # Local surge height estimation
        surge_decay = math.exp(-0.5 * ((dist_km / (rmw * 1.2)) ** 1.8))
        est_surge_height = max(0.0, peak_surge_m * surge_decay)
        est_surge_over_ground = max(0.0, round(est_surge_height - asset.elevation_m, 2))

        # Risk scoring
        if est_surge_over_ground > 1.8 or est_wind_kmh > 150:
            risk_level = "Severe Inundation"
            damage_pct = min(100.0, round(50.0 + est_surge_over_ground * 20.0 + (est_wind_kmh - 120) * 0.4, 1))
            action = "Immediate structural hardening, deploy mobile generators, and initiate asset shutdown."
            cost = 450000.0
        elif est_surge_over_ground > 0.4 or est_wind_kmh > 100:
            risk_level = "Moderate Flooding"
            damage_pct = round(20.0 + est_surge_over_ground * 15.0, 1)
            action = "Deploy sandbag barriers, position emergency repair crews, and elevate backup batteries."
            cost = 120000.0
        elif est_wind_kmh > 75:
            risk_level = "Wind Hazard Only"
            damage_pct = round(5.0 + (est_wind_kmh - 75) * 0.2, 1)
            action = "Secure loose equipment, inspect antenna guy wires, and monitor feeder lines."
            cost = 25000.0
        else:
            risk_level = "Safe"
            damage_pct = 0.0
            action = "Nominal readiness monitoring. Maintain standard operational state."
            cost = 0.0

        reports.append(AssetVulnerabilityReport(
            asset=asset,
            estimated_wind_kmh=est_wind_kmh,
            estimated_surge_m=est_surge_over_ground,
            inundation_risk=risk_level,
            damage_score_percent=damage_pct,
            recommended_action=action,
            estimated_repair_cost_usd=cost
        ))

    return reports
