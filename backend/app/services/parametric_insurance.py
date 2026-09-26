from typing import List
from datetime import datetime
from app.models import ParametricTrigger, TrackPoint

INITIAL_PARAMETRIC_POLICIES: List[ParametricTrigger] = [
    ParametricTrigger(
        id="POL-OD-001",
        zone_name="Odisha Coastal Resilience Zone A",
        district="Jagatsinghpur & Bhadrak",
        beneficiary_authority="Odisha State Disaster Management Authority (OSDMA)",
        payout_tier_usd=200000000.0,  # ₹20 Crore pre-landfall liquidity
        wind_threshold_kmh=120.0,
        surge_threshold_m=2.0,
        current_max_wind_kmh=0.0,
        current_max_surge_m=0.0,
        status="STANDBY",
        liquidity_dispatched=False,
        trigger_timestamp=None
    ),
    ParametricTrigger(
        id="POL-WB-002",
        zone_name="Sundarbans Biosphere & Estuary Zone",
        district="South 24 Parganas",
        beneficiary_authority="West Bengal Disaster Management Dept",
        payout_tier_usd=150000000.0,  # ₹15 Crore pre-landfall liquidity
        wind_threshold_kmh=110.0,
        surge_threshold_m=1.8,
        current_max_wind_kmh=0.0,
        current_max_surge_m=0.0,
        status="STANDBY",
        liquidity_dispatched=False,
        trigger_timestamp=None
    ),
    ParametricTrigger(
        id="POL-BD-003",
        zone_name="Chattogram & Cox's Bazar Coastal Belt",
        district="Cox's Bazar",
        beneficiary_authority="Ministry of Disaster Management & Relief (Bangladesh)",
        payout_tier_usd=250000000.0,  # ₹25 Crore pre-landfall liquidity
        wind_threshold_kmh=125.0,
        surge_threshold_m=2.2,
        current_max_wind_kmh=0.0,
        current_max_surge_m=0.0,
        status="STANDBY",
        liquidity_dispatched=False,
        trigger_timestamp=None
    )
]

def evaluate_parametric_triggers(max_wind_kmh: float, peak_surge_m: float) -> List[ParametricTrigger]:
    """
    Evaluates forecast/live meteorological metrics against parametric trigger thresholds.
    Triggers automated pre-landfall liquidity dispatches when index thresholds are breached.
    """
    evaluated_triggers: List[ParametricTrigger] = []

    for pol in INITIAL_PARAMETRIC_POLICIES:
        pol_copy = pol.copy()
        pol_copy.current_max_wind_kmh = max_wind_kmh
        pol_copy.current_max_surge_m = peak_surge_m

        wind_breach = max_wind_kmh >= pol.wind_threshold_kmh
        surge_breach = peak_surge_m >= pol.surge_threshold_m

        if wind_breach or surge_breach:
            pol_copy.status = "TRIGGERED"
            pol_copy.liquidity_dispatched = True
            pol_copy.trigger_timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        elif max_wind_kmh >= (pol.wind_threshold_kmh * 0.8) or peak_surge_m >= (pol.surge_threshold_m * 0.8):
            pol_copy.status = "MONITORING"
            pol_copy.liquidity_dispatched = False
        else:
            pol_copy.status = "STANDBY"
            pol_copy.liquidity_dispatched = False

        evaluated_triggers.append(pol_copy)

    return evaluated_triggers
