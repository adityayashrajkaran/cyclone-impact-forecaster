import React from 'react';
import type { CycloneTrack } from '../types';
import { Wind, Activity, Layers, FileText, Landmark, Satellite } from 'lucide-react';

interface HeaderProps {
  cyclones: CycloneTrack[];
  selectedCyclone: CycloneTrack;
  onSelectCyclone: (cyclone: CycloneTrack) => void;
  activeTab: 'map' | 'exposure' | 'advisory' | 'parametric' | 'gee';
  setActiveTab: (tab: 'map' | 'exposure' | 'advisory' | 'parametric' | 'gee') => void;
}

export const Header: React.FC<HeaderProps> = ({
  cyclones,
  selectedCyclone,
  onSelectCyclone,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="bg-[#e6ecf5] shadow-[4px_4px_12px_#c2d0e3,-4px_-4px_12px_#ffffff] sticky top-0 z-50">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & System Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center overflow-hidden rounded-full w-12 h-12">
            <img src="/logo.png" alt="ResiliTrack Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm tracking-tight text-slate-800">RESILITRACK CYCLONE AI</h1>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Bay of Bengal & Coastal APAC Risk Forecaster
            </p>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-3">
          {/* Cyclone Dropdown Selector (Neumorphic Inset) */}
          <div className="flex items-center gap-2 bg-[#e6ecf5] shadow-[inset_2px_2px_5px_#c2d0e3,inset_-2px_-2px_5px_#ffffff] rounded-xl px-3 py-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-slate-500 font-medium hidden sm:inline">Event:</span>
            <select
              value={selectedCyclone.id}
              onChange={(e) => {
                const cy = cyclones.find((c) => c.id === e.target.value);
                if (cy) onSelectCyclone(cy);
              }}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {cyclones.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#e6ecf5] text-slate-800">
                  {c.name} ({c.current_category})
                </option>
              ))}
            </select>
          </div>

          {/* GEE Live Indicator */}
          
        </div>
      </div>

      {/* Neumorphic Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3 pt-1 flex items-center gap-3 text-xs overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'map'
              ? 'bg-[#e6ecf5] shadow-[inset_3px_3px_6px_#c2d0e3,inset_-3px_-3px_6px_#ffffff] text-slate-900'
              : 'bg-[#e6ecf5] shadow-[3px_3px_6px_#c2d0e3,-3px_-3px_6px_#ffffff] text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Spatial GIS & Surge Model
        </button>

        <button
          onClick={() => setActiveTab('exposure')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'exposure'
              ? 'bg-[#e6ecf5] shadow-[inset_3px_3px_6px_#c2d0e3,inset_-3px_-3px_6px_#ffffff] text-slate-900'
              : 'bg-[#e6ecf5] shadow-[3px_3px_6px_#c2d0e3,-3px_-3px_6px_#ffffff] text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Infrastructure Risk Table
        </button>

        <button
          onClick={() => setActiveTab('advisory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'advisory'
              ? 'bg-[#e6ecf5] shadow-[inset_3px_3px_6px_#c2d0e3,inset_-3px_-3px_6px_#ffffff] text-slate-900'
              : 'bg-[#e6ecf5] shadow-[3px_3px_6px_#c2d0e3,-3px_-3px_6px_#ffffff] text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          EOC Advisory Bulletin
        </button>

        <button
          onClick={() => setActiveTab('parametric')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'parametric'
              ? 'bg-[#e6ecf5] shadow-[inset_3px_3px_6px_#c2d0e3,inset_-3px_-3px_6px_#ffffff] text-slate-900'
              : 'bg-[#e6ecf5] shadow-[3px_3px_6px_#c2d0e3,-3px_-3px_6px_#ffffff] text-slate-600 hover:text-slate-900'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          Parametric Insurance
        </button>

        <button
          onClick={() => setActiveTab('gee')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'gee'
              ? 'bg-[#e6ecf5] shadow-[inset_3px_3px_6px_#c2d0e3,inset_-3px_-3px_6px_#ffffff] text-slate-900'
              : 'bg-[#e6ecf5] shadow-[3px_3px_6px_#c2d0e3,-3px_-3px_6px_#ffffff] text-slate-600 hover:text-slate-900'
          }`}
        >
          <Satellite className="w-3.5 h-3.5" />
          Earth Observation Feeds
        </button>
      </div>
    </header>
  );
};
