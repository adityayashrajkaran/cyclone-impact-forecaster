import React from 'react';
import type { ParametricTrigger } from '../../types';

interface ParametricDashboardProps {
  triggers: ParametricTrigger[];
  maxWindSpeed: number;
  peakSurge: number;
}

export const ParametricDashboard: React.FC<ParametricDashboardProps> = ({ triggers, maxWindSpeed, peakSurge }) => {
  const totalPayout = triggers
    .filter((t) => t.status === 'TRIGGERED')
    .reduce((acc, t) => acc + t.payout_tier_usd, 0);

  const formatCrores = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(1)} Crore`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-[#e6ecf5] shadow-[6px_6px_14px_#c2d0e3,-6px_-6px_14px_#ffffff] text-slate-900 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase font-mono">
            Parametric Insurance & Pre-Landfall Liquidity
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Automated index triggers releasing pre-landfall liquidity to fund anticipatory evacuation.
          </p>
        </div>

        <div className="bg-[#e6ecf5] shadow-[inset_2px_2px_5px_#c2d0e3,inset_-2px_-2px_5px_#ffffff] px-4 py-2 rounded-xl font-mono text-right">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Total Liquidity Dispatched</div>
          <div className="text-lg font-extrabold text-emerald-700">
            {formatCrores(totalPayout)}
          </div>
        </div>
      </div>

      {/* Parametric Policy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {triggers.map((t) => {
          const isTriggered = t.status === 'TRIGGERED';
          const isMonitoring = t.status === 'MONITORING';

          return (
            <div
              key={t.id}
              className="bg-[#e6ecf5] shadow-[6px_6px_14px_#c2d0e3,-6px_-6px_14px_#ffffff] rounded-2xl p-5 space-y-4"
            >
              {/* Policy Header */}
              <div className="flex items-start justify-between border-b border-slate-300/60 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">{t.id}</span>
                  <h3 className="font-extrabold text-xs text-slate-900">{t.zone_name}</h3>
                  <div className="text-xs text-slate-600 font-medium">{t.district}</div>
                </div>

                {isTriggered ? (
                  <span className="bg-[#e6ecf5] shadow-[inset_2px_2px_4px_#c2d0e3,inset_-2px_-2px_4px_#ffffff] text-emerald-700 text-[11px] px-3 py-1 rounded-full font-mono font-extrabold">
                    DISPATCHED
                  </span>
                ) : isMonitoring ? (
                  <span className="bg-[#e6ecf5] shadow-[inset_2px_2px_4px_#c2d0e3,inset_-2px_-2px_4px_#ffffff] text-amber-700 text-[11px] px-3 py-1 rounded-full font-mono font-extrabold">
                    MONITORING
                  </span>
                ) : (
                  <span className="bg-[#e6ecf5] shadow-[inset_2px_2px_4px_#c2d0e3,inset_-2px_-2px_4px_#ffffff] text-slate-600 text-[11px] px-3 py-1 rounded-full font-mono font-bold">
                    STANDBY
                  </span>
                )}
              </div>

              {/* Payout & Beneficiary */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-500 font-bold">Beneficiary Authority:</div>
                <div className="text-xs font-bold text-slate-800">{t.beneficiary_authority}</div>
                <div className="mt-1 text-xl font-extrabold font-mono text-emerald-700">
                  {formatCrores(t.payout_tier_usd)} Payout Tier
                </div>
              </div>

              {/* Verification Gauge Comparison */}
              <div className="bg-[#e6ecf5] shadow-[inset_2px_2px_5px_#c2d0e3,inset_-2px_-2px_5px_#ffffff] p-3 rounded-xl space-y-2 text-xs">
                <div className="font-extrabold text-slate-800 border-b border-slate-300/60 pb-1 text-[11px] uppercase font-mono">
                  Parametric Threshold Gauge
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Max Wind:</span>
                  <span className="font-mono">
                    <span className={maxWindSpeed >= t.wind_threshold_kmh ? 'text-rose-600 font-bold' : 'text-slate-900 font-extrabold'}>
                      {maxWindSpeed} km/h
                    </span>{' '}
                    <span className="text-slate-500 text-[10px]">(Trigger: &ge;{t.wind_threshold_kmh})</span>
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Peak Surge:</span>
                  <span className="font-mono">
                    <span className={peakSurge >= t.surge_threshold_m ? 'text-rose-600 font-bold' : 'text-slate-900 font-extrabold'}>
                      {peakSurge}m
                    </span>{' '}
                    <span className="text-slate-500 text-[10px]">(Trigger: &ge;{t.surge_threshold_m}m)</span>
                  </span>
                </div>
              </div>

              {/* Status Footer */}
              {isTriggered && (
                <div className="bg-[#e6ecf5] shadow-[inset_2px_2px_4px_#c2d0e3,inset_-2px_-2px_4px_#ffffff] p-2.5 rounded-xl text-xs text-emerald-800 flex items-center justify-between font-mono font-bold">
                  <span>Liquidity Released</span>
                  <span className="text-[10px] text-emerald-700">{t.trigger_timestamp || 'Active'}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Anticipatory Action Payout Allocation Roadmap */}
      <div className="bg-[#e6ecf5] shadow-[6px_6px_14px_#c2d0e3,-6px_-6px_14px_#ffffff] rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-extrabold text-slate-900 uppercase font-mono tracking-wider">
          Pre-Landfall Action Expenditure Protocol
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-slate-700">
          <div className="bg-[#e6ecf5] shadow-[inset_2px_2px_5px_#c2d0e3,inset_-2px_-2px_5px_#ffffff] p-3.5 rounded-xl space-y-1">
            <div className="font-bold text-slate-900">1. Evacuation Transit</div>
            <div className="text-[11px] text-slate-600 font-medium">Emergency buses, boats, and fuel vouchers for evacuation.</div>
          </div>
          <div className="bg-[#e6ecf5] shadow-[inset_2px_2px_5px_#c2d0e3,inset_-2px_-2px_5px_#ffffff] p-3.5 rounded-xl space-y-1">
            <div className="font-bold text-slate-900">2. Hospital Generators</div>
            <div className="text-[11px] text-slate-600 font-medium">Procuring 72-hour fuel reserves for ICU generators.</div>
          </div>
          <div className="bg-[#e6ecf5] shadow-[inset_2px_2px_5px_#c2d0e3,inset_-2px_-2px_5px_#ffffff] p-3.5 rounded-xl space-y-1">
            <div className="font-bold text-slate-900">3. Shelter Rations</div>
            <div className="text-[11px] text-slate-600 font-medium">Pre-stocking dry food rations, water purification units.</div>
          </div>
          <div className="bg-[#e6ecf5] shadow-[inset_2px_2px_5px_#c2d0e3,inset_-2px_-2px_5px_#ffffff] p-3.5 rounded-xl space-y-1">
            <div className="font-bold text-slate-900">4. Geo-Tube Defense</div>
            <div className="text-[11px] text-slate-600 font-medium">Rapid placement of sandbags & geotextiles at polder breaches.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
