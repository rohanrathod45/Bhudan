/** Small shared helpers used across the server. */

function clamp(value, min = 0, max = 100) {
  if (value == null || Number.isNaN(Number(value))) return min;
  return Math.min(max, Math.max(min, Number(value)));
}

function round(value, decimals = 1) {
  const f = Math.pow(10, decimals);
  return Math.round(Number(value) * f) / f;
}

function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowISO() {
  return new Date().toISOString();
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function pct(part, whole) {
  if (!whole) return 0;
  return round((part / whole) * 100, 0);
}

module.exports = { clamp, round, uid, nowISO, haversineKm, pct };