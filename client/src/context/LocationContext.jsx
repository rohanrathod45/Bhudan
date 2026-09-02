import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { analysisApi } from '../services/api';

const DEFAULT_DISTRICT_DATA = [
  // 1. Andhra Pradesh
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.68, lng: 83.21, region: 'coast' },
  { name: 'Guntur', state: 'Andhra Pradesh', lat: 16.3, lng: 80.44, region: 'coast' },
  { name: 'Krishna', state: 'Andhra Pradesh', lat: 16.51, lng: 80.63, region: 'coast' },
  { name: 'East Godavari', state: 'Andhra Pradesh', lat: 17.0, lng: 81.8, region: 'coast' },
  { name: 'Chittoor', state: 'Andhra Pradesh', lat: 13.21, lng: 79.1, region: 'semi' },

  // 2. Arunachal Pradesh
  { name: 'Papum Pare', state: 'Arunachal Pradesh', lat: 27.08, lng: 93.6, region: 'hill' },
  { name: 'Tawang', state: 'Arunachal Pradesh', lat: 27.58, lng: 91.86, region: 'himalaya' },

  // 3. Assam
  { name: 'Kamrup', state: 'Assam', lat: 26.14, lng: 91.73, region: 'plain' },
  { name: 'Barpeta', state: 'Assam', lat: 26.32, lng: 91.0, region: 'plain' },
  { name: 'Cachar', state: 'Assam', lat: 24.83, lng: 92.77, region: 'hill' },
  { name: 'Dibrugarh', state: 'Assam', lat: 27.47, lng: 94.91, region: 'plain' },

  // 4. Bihar
  { name: 'Patna', state: 'Bihar', lat: 25.59, lng: 85.13, region: 'plain' },
  { name: 'Gaya', state: 'Bihar', lat: 24.79, lng: 85.0, region: 'plain' },
  { name: 'Bhagalpur', state: 'Bihar', lat: 25.24, lng: 86.98, region: 'plain' },

  // 5. Chhattisgarh
  { name: 'Raipur', state: 'Chhattisgarh', lat: 21.25, lng: 81.62, region: 'plain' },
  { name: 'Bastar', state: 'Chhattisgarh', lat: 19.08, lng: 82.01, region: 'hill' },

  // 6. Goa
  { name: 'North Goa', state: 'Goa', lat: 15.49, lng: 73.82, region: 'coast' },
  { name: 'South Goa', state: 'Goa', lat: 15.2, lng: 74.0, region: 'coast' },

  // 7. Gujarat
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.03, lng: 72.58, region: 'semi' },
  { name: 'Surat', state: 'Gujarat', lat: 21.17, lng: 72.83, region: 'coast' },
  { name: 'Kutch', state: 'Gujarat', lat: 23.24, lng: 69.66, region: 'desert' },
  { name: 'Vadodara', state: 'Gujarat', lat: 22.31, lng: 73.18, region: 'plain' },

  // 8. Haryana
  { name: 'Gurugram', state: 'Haryana', lat: 28.46, lng: 77.02, region: 'plain' },
  { name: 'Hisar', state: 'Haryana', lat: 29.15, lng: 75.72, region: 'desert' },

  // 9. Himachal Pradesh
  { name: 'Shimla', state: 'Himachal Pradesh', lat: 31.1, lng: 77.17, region: 'himalaya' },
  { name: 'Kangra', state: 'Himachal Pradesh', lat: 32.1, lng: 76.28, region: 'hill' },
  { name: 'Kullu', state: 'Himachal Pradesh', lat: 31.95, lng: 77.1, region: 'himalaya' },
  { name: 'Mandi', state: 'Himachal Pradesh', lat: 31.7, lng: 76.93, region: 'himalaya' },

  // 10. Jharkhand
  { name: 'Ranchi', state: 'Jharkhand', lat: 23.34, lng: 85.3, region: 'hill' },
  { name: 'Dhanbad', state: 'Jharkhand', lat: 23.79, lng: 86.43, region: 'plain' },

  // 11. Karnataka
  { name: 'Bengaluru Urban', state: 'Karnataka', lat: 12.97, lng: 77.57, region: 'semi' },
  { name: 'Mysuru', state: 'Karnataka', lat: 12.29, lng: 76.64, region: 'semi' },
  { name: 'Dakshina Kannada', state: 'Karnataka', lat: 12.91, lng: 74.86, region: 'coast' },
  { name: 'Shivamogga', state: 'Karnataka', lat: 13.93, lng: 75.57, region: 'hill' },

  // 12. Kerala
  { name: 'Wayanad', state: 'Kerala', lat: 11.65, lng: 76.1, region: 'hill' },
  { name: 'Idukki', state: 'Kerala', lat: 9.9, lng: 77.05, region: 'hill' },
  { name: 'Alappuzha', state: 'Kerala', lat: 9.49, lng: 76.32, region: 'coast' },
  { name: 'Kozhikode', state: 'Kerala', lat: 11.25, lng: 75.78, region: 'coast' },
  { name: 'Thrissur', state: 'Kerala', lat: 10.52, lng: 76.21, region: 'coast' },
  { name: 'Ernakulam', state: 'Kerala', lat: 9.98, lng: 76.28, region: 'coast' },

  // 13. Madhya Pradesh
  { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.25, lng: 77.41, region: 'semi' },
  { name: 'Indore', state: 'Madhya Pradesh', lat: 22.71, lng: 75.87, region: 'semi' },
  { name: 'Gwalior', state: 'Madhya Pradesh', lat: 26.18, lng: 78.17, region: 'plain' },

  // 14. Maharashtra
  { name: 'Mumbai Suburban', state: 'Maharashtra', lat: 19.08, lng: 72.88, region: 'coast' },
  { name: 'Pune', state: 'Maharashtra', lat: 18.52, lng: 73.86, region: 'semi' },
  { name: 'Nagpur', state: 'Maharashtra', lat: 21.15, lng: 79.09, region: 'plain' },
  { name: 'Ratnagiri', state: 'Maharashtra', lat: 17.0, lng: 73.27, region: 'coast' },
  { name: 'Sindhudurg', state: 'Maharashtra', lat: 16.0, lng: 73.8, region: 'coast' },

  // 15. Manipur
  { name: 'Imphal West', state: 'Manipur', lat: 24.81, lng: 93.94, region: 'hill' },

  // 16. Meghalaya
  { name: 'East Khasi Hills', state: 'Meghalaya', lat: 25.57, lng: 91.88, region: 'hill' },

  // 17. Mizoram
  { name: 'Aizawl', state: 'Mizoram', lat: 23.72, lng: 92.71, region: 'hill' },

  // 18. Nagaland
  { name: 'Kohima', state: 'Nagaland', lat: 25.67, lng: 94.1, region: 'hill' },

  // 19. Odisha
  { name: 'Khordha', state: 'Odisha', lat: 20.29, lng: 85.82, region: 'coast' },
  { name: 'Balasore', state: 'Odisha', lat: 21.49, lng: 86.92, region: 'coast' },
  { name: 'Puri', state: 'Odisha', lat: 19.81, lng: 85.83, region: 'coast' },

  // 20. Punjab
  { name: 'Ludhiana', state: 'Punjab', lat: 30.9, lng: 75.86, region: 'plain' },
  { name: 'Amritsar', state: 'Punjab', lat: 31.63, lng: 74.87, region: 'plain' },

  // 21. Rajasthan
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.92, lng: 75.82, region: 'desert' },
  { name: 'Jodhpur', state: 'Rajasthan', lat: 26.32, lng: 73.38, region: 'desert' },
  { name: 'Barmer', state: 'Rajasthan', lat: 25.69, lng: 71.9, region: 'desert' },

  // 22. Sikkim
  { name: 'East Sikkim', state: 'Sikkim', lat: 27.34, lng: 88.61, region: 'himalaya' },
  { name: 'North Sikkim', state: 'Sikkim', lat: 27.7, lng: 88.58, region: 'himalaya' },

  // 23. Tamil Nadu
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.08, lng: 80.27, region: 'coast' },
  { name: 'Cuddalore', state: 'Tamil Nadu', lat: 11.74, lng: 79.77, region: 'coast' },
  { name: 'Nagapattinam', state: 'Tamil Nadu', lat: 10.77, lng: 79.84, region: 'coast' },
  { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.02, lng: 77.0, region: 'semi' },

  // 24. Telangana
  { name: 'Hyderabad', state: 'Telangana', lat: 17.38, lng: 78.48, region: 'semi' },

  // 25. Tripura
  { name: 'West Tripura', state: 'Tripura', lat: 23.83, lng: 91.29, region: 'plain' },

  // 26. Uttar Pradesh
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.85, lng: 80.95, region: 'plain' },
  { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.32, lng: 82.99, region: 'plain' },
  { name: 'Kanpur Nagar', state: 'Uttar Pradesh', lat: 26.45, lng: 80.33, region: 'plain' },

  // 27. Uttarakhand
  { name: 'Dehradun', state: 'Uttarakhand', lat: 30.32, lng: 78.04, region: 'himalaya' },
  { name: 'Haridwar', state: 'Uttarakhand', lat: 29.94, lng: 78.16, region: 'plain' },
  { name: 'Chamoli', state: 'Uttarakhand', lat: 30.42, lng: 79.32, region: 'himalaya' },
  { name: 'Nainital', state: 'Uttarakhand', lat: 29.39, lng: 79.45, region: 'himalaya' },
  { name: 'Uttarkashi', state: 'Uttarakhand', lat: 30.73, lng: 78.45, region: 'himalaya' },

  // 28. West Bengal
  { name: 'Kolkata', state: 'West Bengal', lat: 22.57, lng: 88.36, region: 'coast' },
  { name: 'Darjeeling', state: 'West Bengal', lat: 27.04, lng: 88.26, region: 'himalaya' },
  { name: 'South 24 Parganas', state: 'West Bengal', lat: 22.17, lng: 88.43, region: 'coast' },

  // UTs
  { name: 'South Andaman', state: 'Andaman & Nicobar', lat: 11.62, lng: 92.72, region: 'island' },
  { name: 'Chandigarh', state: 'Chandigarh', lat: 30.73, lng: 76.78, region: 'plain' },
  { name: 'Daman', state: 'Dadra & Nagar Haveli and Daman & Diu', lat: 20.39, lng: 72.83, region: 'coast' },
  { name: 'New Delhi', state: 'Delhi', lat: 28.61, lng: 77.2, region: 'plain' },
  { name: 'Srinagar', state: 'Jammu & Kashmir', lat: 34.08, lng: 74.79, region: 'himalaya' },
  { name: 'Jammu', state: 'Jammu & Kashmir', lat: 32.72, lng: 74.85, region: 'plain' },
  { name: 'Leh', state: 'Ladakh', lat: 34.16, lng: 77.57, region: 'himalaya' },
  { name: 'Lakshadweep', state: 'Lakshadweep', lat: 10.56, lng: 72.63, region: 'island' },
  { name: 'Puducherry', state: 'Puducherry', lat: 11.94, lng: 79.83, region: 'coast' },
];

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
