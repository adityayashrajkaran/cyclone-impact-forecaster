import React, { useState, useEffect } from 'react';
import type { CycloneTrack, SurgeSimulationResponse, ExposureResponse, ParametricTrigger } from './types';
import { fetchCycloneTracks, simulateSurge, evaluateExposure, fetchParametricTriggers, FALLBACK_CYCLONES } from './services/api';
import { Header } from './components/Header';
import { CycloneMap } from './components/Map/CycloneMap';
import { TrackControls } from './components/TrackSimulator/TrackControls';
import { VulnerabilityTable } from './components/Infrastructure/VulnerabilityTable';
import { GeminiAdvisoryPanel } from './components/Advisory/GeminiAdvisoryPanel';
import { ParametricDashboard } from './components/Parametric/ParametricDashboard';
import { GEEDataPanel } from './components/GEE/GEEDataPanel';

export function App() {
  const [cyclones, setCyclones] = useState<CycloneTrack[]>(FALLBACK_CYCLONES);
  const [selectedCyclone, setSelectedCyclone] = useState<CycloneTrack>(FALLBACK_CYCLONES[0]);
  const [activeTab, setActiveTab] = useState<'map' | 'exposure' | 'advisory' | 'parametric' | 'gee'>('map');

  // Simulator Parameters
  const [centralPressure, setCentralPressure] = useState<number>(974);
  const [maxWindSpeed, setMaxWindSpeed] = useState<number>(135);
  const [tidalOffset, setTidalOffset] = useState<number>(0.8);
  const [bathymetrySlope, setBathymetrySlope] = useState<number>(0.001);
  const [showSurge, setShowSurge] = useState<boolean>(true);
  const [showInfra, setShowInfra] = useState<boolean>(true);

  // Computed State
  const [surgeData, setSurgeData] = useState<SurgeSimulationResponse | null>(null);
  const [exposureData, setExposureData] = useState<ExposureResponse | null>(null);
  const [parametricTriggers, setParametricTriggers] = useState<ParametricTrigger[]>([]);

  // Load backend tracks on mount
  useEffect(() => {
    fetchCycloneTracks().then((data) => {
      if (data && data.length > 0) {
        setCyclones(data);
        setSelectedCyclone(data[0]);
        const lf = data[0].points[data[0].points.length - 1];
        setCentralPressure(lf.central_pressure_hpa);
        setMaxWindSpeed(lf.max_wind_kmh);
      }
    });
  }, []);

  // Recalculate surge, exposure, and parametric triggers when storm or parameters change
  const runSimulation = async (cy: CycloneTrack = selectedCyclone) => {
    // Create a modified copy of the landfall point with slider inputs
    const pointsCopy = cy.points.map((pt, idx) => {
      if (idx === cy.points.length - 1) {
        return {
          ...pt,
          central_pressure_hpa: centralPressure,
          max_wind_kmh: maxWindSpeed
        };
      }
      return pt;
    });

    const sData = await simulateSurge(cy.id, pointsCopy, tidalOffset, bathymetrySlope);
    setSurgeData(sData);

    const eData = await evaluateExposure(cy.id, pointsCopy, tidalOffset);
    setExposureData(eData);

    const pTriggers = await fetchParametricTriggers(maxWindSpeed, sData.peak_surge_m);
    setParametricTriggers(pTriggers);
  };

  useEffect(() => {
    runSimulation(selectedCyclone);
  }, [selectedCyclone]);

  const handleSelectCyclone = (cy: CycloneTrack) => {
    setSelectedCyclone(cy);
    const lf = cy.points[cy.points.length - 1];
    setCentralPressure(lf.central_pressure_hpa);
    setMaxWindSpeed(lf.max_wind_kmh);
  };

  const peakSurge = surgeData ? surgeData.peak_surge_m : 3.2;

  const triggeredTotal = parametricTriggers
    .filter((t) => t.status === 'TRIGGERED')
    .reduce((acc, t) => acc + t.payout_tier_usd, 0);

  const formatRupeesCrore = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(1)} Cr`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-[#e6ecf5] text-slate-800 flex flex-col font-sans">
      {/* Neumorphic Header Bar */}
      <Header
        cyclones={cyclones}
        selectedCyclone={selectedCyclone}
        onSelectCyclone={handleSelectCyclone}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* TAB 1: SPATIAL GIS MAP & SURGE SIMULATOR */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            {/* Neumorphic Metric Overview Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#e6ecf5] shadow-[6px_6px_14px_#c2d0e3,-6px_-6px_14px_#ffffff] p-4 rounded-2xl">
                <div className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Peak Sustained Wind</div>
                <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">{maxWindSpeed} km/h</div>
              </div>

              <div className="bg-[#e6ecf5] shadow-[6px_6px_14px_#c2d0e3,-6px_-6px_14px_#ffffff] p-4 rounded-2xl">
                <div className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Projected Surge</div>
                <div className="text-xl font-extrabold text-rose-600 font-mono mt-0.5">+{peakSurge} meters</div>
              </div>

              <div className="bg-[#e6ecf5] shadow-[6px_6px_14px_#c2d0e3,-6px_-6px_14px_#ffffff] p-4 rounded-2xl">
                <div className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Threatened Nodes</div>
                <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                  {exposureData ? exposureData.severe_inundation_count : 3} Critical
                </div>
              </div>

              <div className="bg-[#e6ecf5] shadow-[6px_6px_14px_#c2d0e3,-6px_-6px_14px_#ffffff] p-4 rounded-2xl">
                <div className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Parametric Liquidity</div>
                <div className="text-xl font-extrabold text-emerald-700 font-mono mt-0.5">
                  {triggeredTotal > 0 ? formatRupeesCrore(triggeredTotal) : 'STANDBY'}
                </div>
              </div>
            </div>

            {/* Split View: Spatial GIS Map + Physics Controls Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CycloneMap
                  track={selectedCyclone}
                  surgeGrid={surgeData ? surgeData.grid : []}
                  vulnerabilities={exposureData ? exposureData.vulnerability_reports : []}
                  showSurge={showSurge}
                  showInfra={showInfra}
                />
              </div>

              <div>
                <TrackControls
                  track={selectedCyclone}
                  centralPressure={centralPressure}
                  setCentralPressure={setCentralPressure}
                  maxWindSpeed={maxWindSpeed}
                  setMaxWindSpeed={setMaxWindSpeed}
                  tidalOffset={tidalOffset}
                  setTidalOffset={setTidalOffset}
                  bathymetrySlope={bathymetrySlope}
                  setBathymetrySlope={setBathymetrySlope}
                  showSurge={showSurge}
                  setShowSurge={setShowSurge}
                  showInfra={showInfra}
                  setShowInfra={setShowInfra}
                  onApplyCustomTrack={() => runSimulation(selectedCyclone)}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INFRASTRUCTURE RISK TABLE */}
        {activeTab === 'exposure' && exposureData && (
          <VulnerabilityTable exposureData={exposureData} />
        )}

        {/* TAB 3: EOC ADVISORY BULLETIN */}
        {activeTab === 'advisory' && (
          <GeminiAdvisoryPanel cyclone={selectedCyclone} peakSurge={peakSurge} />
        )}

        {/* TAB 4: PARAMETRIC LIQUIDITY */}
        {activeTab === 'parametric' && (
          <ParametricDashboard
            triggers={parametricTriggers}
            maxWindSpeed={maxWindSpeed}
            peakSurge={peakSurge}
          />
        )}

        {/* TAB 5: EARTH OBSERVATION FEEDS */}
        {activeTab === 'gee' && (
          <GEEDataPanel
            lat={selectedCyclone.points[selectedCyclone.points.length - 1]?.lat}
            lng={selectedCyclone.points[selectedCyclone.points.length - 1]?.lng}
          />
        )}
      </main>

      {/* Neumorphic Footer */}
      <footer className="bg-[#e6ecf5] shadow-[inset_2px_2px_5px_#c2d0e3,inset_-2px_-2px_5px_#ffffff] py-4 text-center text-xs text-slate-600 font-semibold mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>ResiliTrack Cyclone AI • Bay of Bengal & Coastal APAC Resilience Platform</span>
          <span className="font-mono text-slate-700">Google Earth Engine & Gemini 3.7 Integrated</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
