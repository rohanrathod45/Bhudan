import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon paths for bundlers.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export const RISK_META = {
  RED: { color: '#dc2626', label: 'Critical' },
  ORANGE: { color: '#ea580c', label: 'High' },
  YELLOW: { color: '#ca8a04', label: 'Moderate' },
  GREEN: { color: '#16a34a', label: 'Low' },
};

// Custom div-icon so each zone gets a distinct teardrop pin.
function zoneIcon(color) {
  return L.divIcon({
    className: 'risk-marker',
    html: `<div class="risk-pin" style="background:${color}"><div class="risk-pin-dot"></div></div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 40],
    popupAnchor: [0, -34],
  });
}

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 10, { duration: 0.8 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function RiskMap({
  zones = [],
  sites = [],
  center = [22.0, 79.0],
  zoom = 5,
  showSites = true,
  showHeat = false,
  onSelectZone,
  selectedId,
}) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
      <TileLayer
        attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
      />
      <FlyTo center={center} zoom={zoom} />

      {zones.map((z) => {
        const meta = RISK_META[z.riskClass] || RISK_META.GREEN;
        return (
          <Marker key={z.habitationId} position={[z.lat, z.lng]} icon={zoneIcon(meta.color)}>
            <Popup>
              <div className="text-sm min-w-[180px]">
                <div className="font-bold text-slate-800">{z.habitation}</div>
                <div className="text-slate-500 text-xs">{z.district} · {z.mainHazards?.join(', ')}</div>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{ background: meta.color + '22', color: meta.color }}
                  >
                    {z.riskClass}
                  </span>
                  <span className="text-slate-700 font-semibold">Risk {z.riskScore}</span>
                </div>
                {onSelectZone && (
                  <button
                    onClick={() => onSelectZone(z)}
                    className="mt-2 text-xs btn-primary px-0 py-1 h-7 w-full"
                  >
                    View details
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {showSites &&
        sites.map((s) => (
          <CircleMarker
            key={s.safeSiteId || s._id || s.id}
            center={[s.lat, s.lng]}
            radius={8}
            pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.6 }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-bold text-slate-800">🏕 {s.name || s.siteName}</div>
                <div className="text-slate-500 text-xs">{s.district}</div>
                <div className="text-slate-700 mt-1">Capacity: {s.availableCapacity ?? s.maxPopulationCapacity}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
    </MapContainer>
  );
}

export function MapLegend() {
  return (
    <div className="card absolute bottom-6 right-4 z-[1000] px-3 py-2 text-xs space-y-1.5">
      <div className="font-semibold text-slate-700 mb-1">Legend</div>
      <div className="space-y-1">
        {Object.entries(RISK_META).map(([k, m]) => (
          <div key={k} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: m.color }} />
            <span className="text-slate-600">{k} — {m.label} Risk</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-sky-500" />
          <span className="text-slate-600">Safe site</span>
        </div>
      </div>
    </div>
  );
}