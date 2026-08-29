import { useEffect, useState } from 'react';
import { analysisApi } from '../services/api';

// Simple module-level cache so every page shares one fetch (labels are static).
let cacheList = null;
let cacheCenters = null;
let inflight = null;

function loadDistricts() {
  if (cacheList) return Promise.resolve({ list: cacheList, centers: cacheCenters });
  if (inflight) return inflight;
  inflight = analysisApi
    .districts()
    .then((res) => {
      const rows = res.data || [];
      cacheList = rows.map((d) => d.name);
      cacheCenters = {};
      rows.forEach((d) => {
        cacheCenters[d.name] = [d.lat, d.lng];
      });
      return { list: cacheList, centers: cacheCenters };
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/**
 * Returns the full India-wide district list + a { district -> [lat, lng] } map.
 * Falls back to the old Kerala districts while the API loads.
 */
export default function useDistricts() {
  const [state, setState] = useState({
    districts: ['Wayanad', 'Idukki', 'Alappuzha', 'Kozhikode', 'Thrissur'],
    centers: {
      Wayanad: [11.55, 76.1],
      Idukki: [9.9, 77.1],
      Alappuzha: [9.49, 76.3],
      Kozhikode: [11.32, 75.8],
      Thrissur: [10.5, 76.2],
    },
  });

  useEffect(() => {
    let active = true;
    loadDistricts().then((res) => {
      // state shape is { districts, centers } — map the loader's { list, centers }
      // into it. Storing `res` directly wiped `districts` and crashed every
      // page that renders districts.map(...)  (e.g. Dashboard after login).
      if (active && res && Array.isArray(res.list)) {
        setState({ districts: res.list, centers: res.centers || {} });
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return state;
}