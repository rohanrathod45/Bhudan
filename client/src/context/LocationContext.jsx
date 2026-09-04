import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { analysisApi } from '../services/api';

import DEFAULT_DISTRICT_DATA from '../data/districts.json';

function processRows(rows) {
  const list = [];
  const centers = {};
  const districtMeta = {};
  const districtsByState = {};

  rows.forEach((d) => {
    list.push(d.name);
    centers[d.name] = [d.lat, d.lng];
    districtMeta[d.name] = d;

    const st = d.state || 'Other';
    if (!districtsByState[st]) districtsByState[st] = [];
    if (!districtsByState[st].includes(d.name)) {
      districtsByState[st].push(d.name);
    }
  });

  const states = Object.keys(districtsByState).sort();

  return {
    districts: list,
    states,
    districtsByState,
    districtMeta,
    centers,
  };
}

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [geoData, setGeoData] = useState(() => processRows(DEFAULT_DISTRICT_DATA));

  // Retrieve saved location without hardcoding any default district
  const [selectedDistrict, setSelectedDistrictState] = useState(() => {
    return localStorage.getItem('bhudan_selected_district') || '';
  });

  const [selectedState, setSelectedStateState] = useState(() => {
    return localStorage.getItem('bhudan_selected_state') || '';
  });

  // Fetch full live district list from server
  useEffect(() => {
    let active = true;
    analysisApi
      .districts()
      .then((res) => {
        if (active && res && res.data && res.data.length) {
          setGeoData(processRows(res.data));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const setSelectedDistrict = (distName) => {
    const val = distName || '';
    setSelectedDistrictState(val);
    if (val) {
      localStorage.setItem('bhudan_selected_district', val);
      const meta = geoData.districtMeta[val];
      if (meta && meta.state) {
        setSelectedStateState(meta.state);
        localStorage.setItem('bhudan_selected_state', meta.state);
      }
    } else {
      localStorage.removeItem('bhudan_selected_district');
    }
  };

  const setSelectedState = (stateName) => {
    const val = stateName || '';
    setSelectedStateState(val);
    if (val) {
      localStorage.setItem('bhudan_selected_state', val);
    } else {
      localStorage.removeItem('bhudan_selected_state');
    }
    setSelectedDistrictState('');
    localStorage.removeItem('bhudan_selected_district');
  };

  const getStateForDistrict = (distName) => {
    return geoData.districtMeta[distName]?.state || '';
  };

  const getCenterForDistrict = (distName) => {
    return geoData.centers[distName] || [22.0, 79.0];
  };

  const value = useMemo(
    () => ({
      ...geoData,
      selectedDistrict,
      selectedState,
      setSelectedDistrict,
      setSelectedState,
      getStateForDistrict,
      getCenterForDistrict,
    }),
    [geoData, selectedDistrict, selectedState]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return ctx;
}

export default LocationContext;
