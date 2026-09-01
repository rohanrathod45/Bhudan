import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, ShieldCheck, MapPin, Eye, AlertTriangle } from 'lucide-react';

// Fix Leaflet default marker icons for bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export const RISK_META = {
  RED: { color: '#ef4444', label: 'Critical (≥70)', minScore: 70 },
  ORANGE: { color: '#f97316', label: 'High (55–69)', minScore: 55 },
  YELLOW: { color: '#eab308', label: 'Moderate (30–54)', minScore: 30 },
  GREEN: { color: '#22c55e', label: 'Low (<30)', minScore: 0 },
};

export function getRiskColor(score) {
  if (score >= 70) return RISK_META.RED.color;
  if (score >= 55) return RISK_META.ORANGE.color;
  if (score >= 30) return RISK_META.YELLOW.color;
  return RISK_META.GREEN.color;
}

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.flyTo(center, zoom || 10, { duration: 0.8 });
    }
  }, [center, zoom, map]);
  return null;
}

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export function getBasemapUrl(type = 'esri_dark') {
  const keyParam = GOOGLE_API_KEY ? `&key=${GOOGLE_API_KEY}` : '';
  switch (type) {
    case 'google_roadmap':
      return `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}${keyParam}`;
    case 'google_satellite':
      return `https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}${keyParam}`;
    case 'google_terrain':
      return `https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}${keyParam}`;
    case 'esri_dark':
    default:
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
  }
}

export default function RiskMap({
  zones = [],
  sites = [],
  relocations = [],
  center = [20.5937, 78.9629], // Center of India
  zoom = 5,
  showSites = true,
  onSelectZone,
  activeHazardFilters = { flood: true, landslide: true, coastal_erosion: true, cloudburst: true },
  basemap = 'esri_dark',
}) {
  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden shadow-2xl border border-white/10">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', background: '#0b1120' }}
        scrollWheelZoom
      >
        {/* Basemap Tile Layer (Esri Dark Canvas / Google Maps) */}
        <TileLayer
          attribution={
            basemap.startsWith('google')
              ? '&copy; <a href="https://maps.google.com">Google Maps</a>'
              : '&copy; <a href="https://www.esri.com/">Esri</a>, USGS, NOAA'
          }
          url={getBasemapUrl(basemap)}
          maxZoom={19}
        />

        <FlyTo center={center} zoom={zoom} />

        {/* 1. Habitations Risk Colored Circle Markers */}
        {zones
          .filter((z) => {
            if (!z.mainHazards || !z.mainHazards.length) return true;
            return z.mainHazards.some((h) => activeHazardFilters[h.toLowerCase()] !== false);
          })
          .map((z) => {
            const score = z.riskScore ?? (z.riskClass === 'RED' ? 85 : z.riskClass === 'ORANGE' ? 62 : z.riskClass === 'YELLOW' ? 42 : 20);
            const color = getRiskColor(score);
            return (
              <CircleMarker
                key={z.habitationId || z.id}
                center={[z.lat, z.lng]}
                radius={score >= 70 ? 10 : 8}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.8,
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => onSelectZone && onSelectZone(z),
                }}
              >
                <Popup className="dark-popup">
                  <div className="p-1 min-w-[200px] text-slate-900 font-sans">
                    <div className="font-bold text-sm text-slate-900">{z.habitation || z.name}</div>
                    <div className="text-xs text-slate-600 font-medium">
                      District: {z.district} • Pop: {(z.populationExposed || z.population || 0).toLocaleString()}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className="text-[11px] font-extrabold px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: color }}
                      >
                        Risk Score: {score}
                      </span>
                      <span className="text-[11px] font-semibold uppercase text-slate-700">
                        {z.mainHazards?.join(', ') || 'Multi-Hazard'}
                      </span>
                    </div>
                    <a
                      href={`/habitations/${z.habitationId || z.id}`}
                      className="mt-3 block text-center text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-1.5 rounded-lg transition-colors shadow"
                    >
                      View Details →
                    </a>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

        {/* 2. Safe Sites Markers */}
        {showSites &&
          sites.map((s) => (
            <CircleMarker
              key={s.safeSiteId || s._id || s.id}
              center={[s.lat, s.lng]}
              radius={9}
              pathOptions={{
                color: '#38bdf8',
                fillColor: '#0284c7',
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Popup>
                <div className="p-1 text-slate-900">
                  <div className="font-bold text-sm flex items-center gap-1">
                    <span>🏕️</span>
                    <span>{s.name || s.siteName}</span>
                  </div>
                  <div className="text-xs text-slate-600">District: {s.district}</div>
                  <div className="text-xs text-slate-800 font-semibold mt-1">
                    Capacity: {(s.availableCapacity ?? s.maxPopulationCapacity ?? 0).toLocaleString()} people
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

        {/* 3. Relocation Animated Lines */}
        {relocations.map((rel, idx) => {
          const color = rel.priority === 'HIGH' ? '#ef4444' : rel.priority === 'MEDIUM' ? '#f97316' : '#22c55e';
          return (
            <Polyline
              key={rel.id || idx}
              positions={[
                [rel.fromLat, rel.fromLng],
                [rel.toLat, rel.toLng],
              ]}
              pathOptions={{
                color: color,
                weight: 3,
                opacity: 0.85,
                dashArray: '8, 8',
                className: 'animated-flow-line',
              }}
            >
              <Tooltip sticky>
                <div className="text-xs font-sans p-1 text-slate-900">
                  <div className="font-bold">{rel.fromName} ➔ {rel.toName}</div>
                  <div>Distance: <span className="font-semibold">{rel.distanceKm} km</span></div>
                  <div>Estimated ETA: <span className="font-semibold">{rel.etaMinutes} mins</span></div>
                  <div>Priority: <span className="font-bold uppercase" style={{ color }}>{rel.priority}</span></div>
                </div>
              </Tooltip>
            </Polyline>
          );
        })}
      </MapContainer>
    </div>
  );
}

{/* Floating Bottom-Left Legend */}
export function MapLegend() {
  return (
    <div className="glass-panel absolute bottom-5 left-5 z-[1000] p-3.5 text-xs text-white space-y-2 shadow-2xl border border-white/15 max-w-[210px]">
      <div className="font-bold text-white text-xs flex items-center space-x-1.5 border-b border-white/10 pb-1.5">
        <MapPin className="h-3.5 w-3.5 text-brand-400" />
        <span>Risk Score Legend</span>
      </div>
      <div className="space-y-1.5">
        {Object.entries(RISK_META).map(([key, meta]) => (
          <div key={key} className="flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: meta.color }} />
              <span className="font-medium text-slate-200">{key}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{meta.label.split(' ')[1]}</span>
          </div>
        ))}
        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10">
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full bg-sky-400 shrink-0" />
            <span className="font-medium text-slate-200">Safe Shelter</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Capacity</span>
        </div>
      </div>
    </div>
  );
}

{/* Floating Top-Right Layer Toggle Panel */}
export function MapLayerControls({ activeFilters = {}, onToggle, basemap = 'esri_dark', onBasemapChange }) {
  return (
    <div className="glass-panel absolute top-5 right-5 z-[1000] p-3 text-xs text-white shadow-2xl border border-white/15 space-y-3 max-w-[210px]">
      {/* Basemap Selection */}
      <div>
        <div className="font-bold text-white text-xs flex items-center space-x-1.5 border-b border-white/10 pb-1.5 mb-2">
          <Layers className="h-3.5 w-3.5 text-brand-300" />
          <span>Basemap Style</span>
        </div>
        <select
          value={basemap}
          onChange={(e) => onBasemapChange && onBasemapChange(e.target.value)}
          className="w-full bg-slate-900/90 text-xs text-white border border-white/20 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
        >
          <option value="esri_dark">🌙 Dark Gray (Esri)</option>
          <option value="google_roadmap">🗺️ Google Roadmap</option>
          <option value="google_satellite">🛰️ Google Satellite</option>
          <option value="google_terrain">⛰️ Google Terrain</option>
        </select>
      </div>

      {/* Hazard Layers */}
      <div>
        <div className="font-bold text-white text-xs flex items-center space-x-1.5 border-b border-white/10 pb-1.5 mb-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          <span>Hazard Layers</span>
        </div>
        <div className="space-y-1.5">
          {[
            { key: 'flood', label: 'Flood Zone' },
            { key: 'landslide', label: 'Landslide Risk' },
            { key: 'coastal_erosion', label: 'Coastal Erosion' },
            { key: 'cloudburst', label: 'Cloudburst' },
          ].map((item) => {
            const checked = activeFilters[item.key] !== false;
            return (
              <label
                key={item.key}
                className="flex items-center justify-between text-[11px] text-slate-200 cursor-pointer hover:text-white transition-colors"
              >
                <span>{item.label}</span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle && onToggle(item.key)}
                  className="rounded border-white/20 bg-white/10 text-brand-500 focus:ring-0 cursor-pointer"
                />
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}