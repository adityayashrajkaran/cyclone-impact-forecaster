import React from 'react';
import type { CycloneTrack } from '../../types';
import { Sliders, RefreshCw } from 'lucide-react';

interface TrackControlsProps {
  track: CycloneTrack;
  centralPressure: number;
  setCentralPressure: (val: number) => void;
  maxWindSpeed: number;
  setMaxWindSpeed: (val: number) => void;
  tidalOffset: number;
  setTidalOffset: (val: number) => void;
  bathymetrySlope: number;
  setBathymetrySlope: (val: number) => void;
  showSurge: boolean;
  setShowSurge: (val: boolean) => void;
  showInfra: boolean;
  setShowInfra: (val: boolean) => void;
  onApplyCustomTrack: () => void;
}

export const TrackControls: React.FC<TrackControlsProps> = ({
  track,
  centralPressure,
  setCentralPressure,
  maxWindSpeed,
  setMaxWindSpeed,
  tidalOffset,
  setTidalOffset,
  bathymetrySlope,
  setBathymetrySlope,
  showSurge,
  setShowSurge,
  showInfra,
  setShowInfra,
  onApplyCustomTrack,
}) => {
  return (
    <div className="bg-[#e6ecf5] shadow-[6px_6px_14px_#c2d0e3,-6px_-6px_14px_#ffffff] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-300/60 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-800" />
          <h2 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
            Storm Hydrodynamics
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-700 bg-[#e6ecf5] shadow-[inset_2px_2px_4px_#c2d0e3,inset_-2px_-2px_4px_#ffffff] px-2.5 py-1 rounded-xl font-bold">
          {track.name}
        </span>
      </div>

      {/* Layer Visibility Neumorphic Toggles */}
      <div className="grid grid-cols-2 gap-3 text-xs font-bold">
        <button
          onClick={() => setShowSurge(!showSurge)}
          className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
            showSurge
              ? 'bg-[#e6ecf5] shadow-[inset_3px_3px_6px_#c2d0e3,inset_-3px_-3px_6px_#ffffff] text-slate-900 border-slate-300/40'
              : 'bg-[#e6ecf5] shadow-[3px_3px_6px_#c2d0e3,-3px_-3px_6px_#ffffff] text-slate-600 border-transparent hover:text-slate-900'
          }`}
        >
          Surge Grid: {showSurge ? 'ON' : 'OFF'}
        </button>

        <button
          onClick={() => setShowInfra(!showInfra)}
          className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
            showInfra
              ? 'bg-[#e6ecf5] shadow-[inset_3px_3px_6px_#c2d0e3,inset_-3px_-3px_6px_#ffffff] text-slate-900 border-slate-300/40'
              : 'bg-[#e6ecf5] shadow-[3px_3px_6px_#c2d0e3,-3px_-3px_6px_#ffffff] text-slate-600 border-transparent hover:text-slate-900'
          }`}
        >
          Infra Nodes: {showInfra ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Slider Controls */}
      <div className="space-y-4 text-xs">
        {/* Central Pressure */}
        <div>
          <div className="flex justify-between items-center mb-1.5 font-medium">
            <span className="text-slate-700">Central Pressure Deficit</span>
            <span className="font-mono text-slate-900 font-bold">{centralPressure} hPa</span>
          </div>
          <input
            type="range"
            min="910"
            max="1000"
            step="1"
            value={centralPressure}
            onChange={(e) => setCentralPressure(Number(e.target.value))}
            className="w-full h-1.5 cursor-pointer"
          />
        </div>

        {/* Max Wind Speed */}
        <div>
          <div className="flex justify-between items-center mb-1.5 font-medium">
            <span className="text-slate-700">Max Sustained Wind</span>
            <span className="font-mono text-slate-900 font-bold">{maxWindSpeed} km/h</span>
          </div>
          <input
            type="range"
            min="65"
            max="260"
            step="5"
            value={maxWindSpeed}
            onChange={(e) => setMaxWindSpeed(Number(e.target.value))}
            className="w-full h-1.5 cursor-pointer"
          />
        </div>

        {/* Tidal Phase Offset */}
        <div>
          <div className="flex justify-between items-center mb-1.5 font-medium">
            <span className="text-slate-700">Astronomical Tide Offset</span>
            <span className="font-mono text-slate-900 font-bold">+{tidalOffset} m</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="2.5"
            step="0.1"
            value={tidalOffset}
            onChange={(e) => setTidalOffset(Number(e.target.value))}
            className="w-full h-1.5 cursor-pointer"
          />
        </div>

        {/* Bathymetry Slope */}
        <div>
          <label className="text-slate-700 block font-medium mb-1.5">Continental Shelf Bathymetry</label>
          <select
            value={bathymetrySlope}
            onChange={(e) => setBathymetrySlope(Number(e.target.value))}
            className="w-full bg-[#e6ecf5] shadow-[inset_2px_2px_5px_#c2d0e3,inset_-2px_-2px_5px_#ffffff] text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer font-semibold"
          >
            <option value={0.0005}>North Bay of Bengal (Ultra-Shallow Shelf)</option>
            <option value={0.001}>Odisha & Sundarbans Coast (Shallow Shelf)</option>
            <option value={0.0025}>Deep Water Offshore (Steep Shelf)</option>
          </select>
        </div>
      </div>

      {/* Neumorphic Extruded Recalculate Button */}
      <button
        onClick={onApplyCustomTrack}
        className="w-full bg-[#e6ecf5] shadow-[4px_4px_8px_#c2d0e3,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#c2d0e3,inset_-2px_-2px_5px_#ffffff] text-slate-900 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5 text-slate-800" />
        Recalculate Hydrodynamics
      </button>
    </div>
  );
};
