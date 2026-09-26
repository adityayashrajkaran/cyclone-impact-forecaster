import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { CycloneTrack, SurgeGridCell, AssetVulnerabilityReport, TrackPoint } from '../../types';

interface CycloneMapProps {
  track: CycloneTrack;
  surgeGrid: SurgeGridCell[];
  vulnerabilities: AssetVulnerabilityReport[];
  showSurge: boolean;
  showInfra: boolean;
  onPointSelect?: (point: TrackPoint) => void;
}

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapRecenter: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 8, { duration: 1.0 });
  }, [lat, lng, map]);
  return null;
};

const MapResizeFix: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const invalidate = () => map.invalidateSize();

    // Fix initial render after layout settles
    const t1 = setTimeout(invalidate, 100);
    const t2 = setTimeout(invalidate, 500);

    // Fix on any future container resize (sidebar toggles, tab switches, etc.)
    const container = map.getContainer();
    const resizeObserver = new ResizeObserver(invalidate);
    resizeObserver.observe(container);

    window.addEventListener('resize', invalidate);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      resizeObserver.disconnect();
      window.removeEventListener('resize', invalidate);
    };
  }, [map]);
  return null;
};

const getCategoryColor = (category: string) => {
  if (category.includes('Super') || category.includes('SuCS')) return '#e11d48';
  if (category.includes('VSCS')) return '#f97316';
  if (category.includes('Severe') || category.includes('SCS')) return '#d97706';
  if (category.includes('Cyclonic')) return '#2563eb';
  return '#0284c7';
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'Critical': return '#e11d48';
    case 'High': return '#f97316';
    case 'Medium': return '#d97706';
    case 'Low': return '#16a34a';
    default: return '#2563eb';
  }
};

export const CycloneMap: React.FC<CycloneMapProps> = ({
  track,
  surgeGrid,
  vulnerabilities,
  showSurge,
  showInfra,
  onPointSelect
}) => {
  const points = track.points || [];
  const landfallPoint = points[points.length - 1] || { lat: 20.80, lng: 87.50 };
  const polylinePositions = points.map((p) => [p.lat, p.lng] as [number, number]);

  return (
    <div className="relative w-full h-[600px] rounded-2xl bg-[#e6ecf5] shadow-[6px_6px_14px_#c2d0e3,-6px_-6px_14px_#ffffff] p-2">
      <div className="w-full h-full rounded-xl overflow-hidden">
        <MapContainer
          center={[landfallPoint.lat, landfallPoint.lng]}
          zoom={8}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          <MapRecenter lat={landfallPoint.lat} lng={landfallPoint.lng} />
          <MapResizeFix />

          {/* CartoDB Voyager Light Base Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Track Line */}
          {polylinePositions.length > 1 && (
            <>
              <Polyline
                positions={polylinePositions}
                pathOptions={{ color: '#1e293b', weight: 4, opacity: 0.15 }}
              />
              <Polyline
                positions={polylinePositions}
                pathOptions={{ color: '#1e293b', weight: 2.5, opacity: 0.95 }}
              />
            </>
          )}

          {/* Landfall Wind Buffer */}
          {landfallPoint && (
            <Circle
              center={[landfallPoint.lat, landfallPoint.lng]}
              radius={(landfallPoint.radius_max_wind_km || 45) * 1000}
              pathOptions={{
                color: '#e11d48',
                fillColor: '#f43f5e',
                fillOpacity: 0.05,
                weight: 1.2,
                dashArray: '4, 4'
              }}
            />
          )}

          {/* Track Point Markers */}
          {points.map((pt, idx) => {
            const color = getCategoryColor(pt.category);
            const isLandfall = idx === points.length - 1;

            return (
              <CircleMarker
                key={pt.id || idx}
                center={[pt.lat, pt.lng]}
                radius={isLandfall ? 9 : 6}
                pathOptions={{
                  color: '#ffffff',
                  fillColor: color,
                  fillOpacity: 0.95,
                  weight: 1.5,
                }}
                eventHandlers={{
                  click: () => onPointSelect && onPointSelect(pt)
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[190px] text-slate-800 text-xs">
                    <div className="font-bold text-sm text-slate-900 mb-1">{pt.category}</div>
                    <div className="text-[11px] text-slate-500 mb-2">{pt.timestamp}</div>
                    <div className="space-y-1 text-xs border-t border-slate-300/60 pt-1.5 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-sans">Max Wind:</span>
                        <span className="font-bold text-slate-900">{pt.max_wind_kmh} km/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-sans">Pressure:</span>
                        <span className="font-bold text-slate-900">{pt.central_pressure_hpa} hPa</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-sans">Est. Surge:</span>
                        <span className="font-bold text-rose-600">{pt.storm_surge_est_m}m</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Surge Inundation Grid */}
          {showSurge &&
            surgeGrid.map((cell, idx) => {
              if (cell.surge_depth_m <= 0.1) return null;
              const color = getRiskColor(cell.risk_level);
              return (
                <CircleMarker
                  key={`surge-${idx}`}
                  center={[cell.lat, cell.lng]}
                  radius={Math.max(4, Math.min(13, cell.surge_depth_m * 3))}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.4,
                    stroke: false
                  }}
                >
                  <Popup>
                    <div className="text-slate-800 p-1 text-xs font-mono">
                      <div className="font-bold text-slate-900 font-sans">Surge Depth: {cell.surge_depth_m}m</div>
                      <div className="text-slate-600 font-sans">DEM Elevation: {cell.elevation_m}m</div>
                      <div className="text-slate-600 font-sans">Risk Level: {cell.risk_level}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

          {/* Infrastructure Asset Markers */}
          {showInfra &&
            vulnerabilities.map((report) => {
              const asset = report.asset;
              const isSevere = report.inundation_risk === 'Severe Inundation';
              const color = isSevere ? '#e11d48' : report.inundation_risk === 'Moderate Flooding' ? '#d97706' : '#16a34a';

              return (
                <CircleMarker
                  key={asset.id}
                  center={[asset.lat, asset.lng]}
                  radius={8}
                  pathOptions={{
                    color: '#ffffff',
                    fillColor: color,
                    fillOpacity: 0.95,
                    weight: 1.5
                  }}
                >
                  <Popup>
                    <div className="p-2 text-slate-800 text-xs min-w-[210px]">
                      <div className="font-bold text-sm text-slate-900 border-b border-slate-300/60 pb-1 mb-1.5">
                        {asset.name}
                      </div>
                      <div className="space-y-1 text-xs text-slate-600">
                        <div>Type: <span className="font-bold text-slate-900">{asset.asset_type}</span></div>
                        <div>District: <span className="text-slate-800">{asset.district}</span></div>
                        <div>Risk Level: <span className={`font-bold ${isSevere ? 'text-rose-600' : 'text-amber-600'}`}>{report.inundation_risk}</span></div>
                        <div>Est. Surge Depth: <strong className="text-slate-900 font-mono">{report.estimated_surge_m}m</strong></div>
                        <div className="bg-[#e6ecf5] p-1.5 rounded-lg mt-1.5 text-[11px] text-slate-700 border border-slate-300/60">
                          {report.recommended_action}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
        </MapContainer>
      </div>

      {/* Neumorphic Floating GIS Legend Overlay */}
      <div className="absolute bottom-5 left-5 bg-[#e6ecf5] shadow-[4px_4px_10px_#c2d0e3,-4px_-4px_10px_#ffffff] p-3.5 rounded-2xl text-slate-800 text-xs z-10 space-y-2 max-w-[280px]">
        <div className="font-extrabold text-slate-900 border-b border-slate-300/60 pb-1 text-[11px] uppercase tracking-wider">
          GIS Layer Legend
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] font-medium text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> SuCS / VSCS
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> SCS
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Cyclonic Storm
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Infra Safe
          </div>
        </div>
        {showSurge && (
          <div className="border-t border-slate-300/60 pt-1.5 flex items-center gap-2 text-[10px] text-slate-600 font-mono">
            <span>Surge:</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-600"></span> &gt;3m</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> 1.5-3m</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600"></span> &lt;1.5m</span>
          </div>
        )}
      </div>
    </div>
  );
};
