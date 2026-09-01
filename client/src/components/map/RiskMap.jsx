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
  RED: { color: '#DC2626', label: 'Critical (≥70)', minScore: 70 },
  ORANGE: { color: '#EA580C', label: 'High (55–69)', minScore: 55 },
  YELLOW: { color: '#CA8A04', label: 'Moderate (30–54)', minScore: 30 },
  GREEN: { color: '#16A34A', label: 'Low (<30)', minScore: 0 },
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

export function getBasemapUrl(type = 'carto_light') {
  const keyParam = GOOGLE_API_KEY ? `&key=${GOOGLE_API_KEY}` : '';
  switch (type) {
    case 'google_roadmap':
      return `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}${keyParam}`;
    case 'google_satellite':
      return `https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}${keyParam}`;
    case 'google_terrain':
      return `https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}${keyParam}`;
    case 'esri_topo':
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
    case 'carto_light':
    default:
      return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
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
  basemap = 'carto_light',
}) {
  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden shadow-sm border border-slate-200">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', background: '#E2E8F0' }}
        scrollWheelZoom
      >
        {/* Basemap Tile Layer */}
        <TileLayer
          attribution={
            basemap.startsWith('google')
              ? '&copy; <a href="https://maps.google.com">Google Maps</a>'
              : '&copy; <a href="https://carto.com/">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
                radius={score >= 70 ? 12 : score >= 55 ? 10 : 8}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.85,
                  color: '#FFFFFF',
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => onSelectZone && onSelectZone(z),
                }}
              >
                <Popup>
                  <div className="p-2 max-w-xs font-sans">
                    <div className="flex items-center space-x-1.5 font-bold text-[#0B2447] text-sm">
                      <AlertTriangle className="h-4 w-4" style={{ color }} />
                      <span>{z.name || z.habitation}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      District: <strong className="text-slate-800">{z.district}</strong>
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs pt-1.5 border-t border-slate-200">
                      <span>Risk Score:</span>
                      <strong className="px-2 py-0.5 rounded text-white text-[11px]" style={{ backgroundColor: color }}>
                        {score} / 100 ({z.riskClass || 'ASSESSED'})
                      </strong>
                    </div>
                    {z.vulnerablePop && (
                      <p className="text-xs text-slate-600 mt-1">
                        Pop at risk: <strong className="text-slate-800">{z.vulnerablePop} people</strong>
                      </p>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

        {/* 2. Safe Sites Shield Markers */}
        {showSites &&
          sites.map((s) => (
            <CircleMarker
              key={s.safeSiteId || s.id}
              center={[s.lat, s.lng]}
              radius={9}
              pathOptions={{
                fillColor: '#15803D',
                fillOpacity: 0.9,
                color: '#FFFFFF',
                weight: 2,
              }}
            >
              <Popup>
                <div className="p-2 max-w-xs font-sans">
                  <div className="flex items-center space-x-1.5 font-bold text-[#15803D] text-sm">
                    <ShieldCheck className="h-4 w-4 text-[#15803D]" />
                    <span>{s.name}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Available Capacity: <strong className="text-slate-800">{s.availableCapacity || s.capacity} persons</strong>
                  </p>
                  <p className="text-xs text-slate-600">
                    Infrastructure Grade: <strong className="text-slate-800">{s.infraScore || 'Grade A'}</strong>
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          ))}

        {/* 3. Relocation Flow Polyline Paths */}
        {relocations.map((line) => (
          <Polyline
            key={line.id}
            positions={[
              [line.fromLat, line.fromLng],
              [line.toLat, line.toLng],
            ]}
            pathOptions={{
              color: line.priority === 'HIGH' ? '#DC2626' : line.priority === 'MEDIUM' ? '#EA580C' : '#0B2447',
              weight: 3,
              opacity: 0.8,
              dashArray: '6, 8',
            }}
          >
            <Tooltip sticky>
              <div className="text-xs font-sans">
                <strong>{line.fromName}</strong> ➔ <strong>{line.toName}</strong>
                <br />
                Distance: {line.distanceKm} km | EST: {line.etaMinutes} mins
              </div>
            </Tooltip>
          </Polyline>
        ))}
      </MapContainer>
    </div>
  );
}

export function MapLegend() {
  return (
    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs text-xs space-y-1.5 font-sans">
      <p className="font-bold text-[#0B2447] text-[11px] uppercase tracking-wider mb-1">Risk Severity Legend</p>
      {Object.entries(RISK_META).map(([key, item]) => (
        <div key={key} className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-slate-700 font-medium">{item.label}</span>
        </div>
      ))}
      <div className="flex items-center space-x-2 pt-1 border-t border-slate-100">
        <span className="w-3 h-3 rounded-full bg-[#15803D]" />
        <span className="text-slate-700 font-medium">Safe Shelter Site</span>
      </div>
    </div>
  );
}