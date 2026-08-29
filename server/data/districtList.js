/**
 * DISTRICT_LIST — curated India-wide demo register.
 * One line per district as [name, state, lat, lng, region].
 * Region drives which hazards the generator assigns (see india.js).
 * Coordinates are approximate district-centre points for the map.
 */

module.exports = [
  // Andaman & Nicobar
  ['South Andaman', 'Andaman & Nicobar', 11.62, 92.72, 'island'],
  // Andhra Pradesh
  ['Visakhapatnam', 'Andhra Pradesh', 17.68, 83.21, 'coast'],
  ['Guntur', 'Andhra Pradesh', 16.3, 80.44, 'coast'],
  ['Krishna', 'Andhra Pradesh', 16.51, 80.63, 'coast'],
  ['Chittoor', 'Andhra Pradesh', 13.21, 79.1, 'semi'],
  // Arunachal Pradesh
  ['Papum Pare', 'Arunachal Pradesh', 27.08, 93.6, 'hill'],
  ['Tawang', 'Arunachal Pradesh', 27.58, 91.86, 'himalaya'],
  // Assam
  ['Kamrup', 'Assam', 26.14, 91.73, 'plain'],
  ['Barpeta', 'Assam', 26.32, 91.0, 'plain'],
  ['Cachar', 'Assam', 24.83, 92.77, 'hill'],
  // Bihar
  ['Patna', 'Bihar', 25.59, 85.13, 'plain'],
  ['Gaya', 'Bihar', 24.79, 85.0, 'plain'],
  ['Bhagalpur', 'Bihar', 25.24, 86.98, 'plain'],
  // Chandigarh
  ['Chandigarh', 'Chandigarh', 30.73, 76.78, 'plain'],
  // Chhattisgarh
  ['Raipur', 'Chhattisgarh', 21.25, 81.62, 'plain'],
  ['Bastar', 'Chhattisgarh', 19.08, 82.01, 'hill'],
  // Delhi
  ['New Delhi', 'Delhi', 28.61, 77.2, 'plain'],
  // Goa
  ['North Goa', 'Goa', 15.49, 73.82, 'coast'],
  ['South Goa', 'Goa', 15.2, 74.0, 'coast'],
  // Gujarat
  ['Ahmedabad', 'Gujarat', 23.03, 72.58, 'semi'],
  ['Surat', 'Gujarat', 21.17, 72.83, 'coast'],
  ['Kutch', 'Gujarat', 23.24, 69.66, 'desert'],
  ['Vadodara', 'Gujarat', 22.31, 73.18, 'plain'],
  // Haryana
  ['Gurugram', 'Haryana', 28.46, 77.02, 'plain'],
  ['Hisar', 'Haryana', 29.15, 75.72, 'desert'],
  // Himachal Pradesh
  ['Shimla', 'Himachal Pradesh', 31.1, 77.17, 'himalaya'],
  ['Kangra', 'Himachal Pradesh', 32.1, 76.28, 'hill'],
  ['Kullu', 'Himachal Pradesh', 31.95, 77.1, 'himalaya'],
  // Jammu & Kashmir
  ['Srinagar', 'Jammu & Kashmir', 34.08, 74.79, 'himalaya'],
  ['Jammu', 'Jammu & Kashmir', 32.72, 74.85, 'plain'],
  ['Anantnag', 'Jammu & Kashmir', 33.73, 75.14, 'himalaya'],
  // Jharkhand
  ['Ranchi', 'Jharkhand', 23.34, 85.3, 'hill'],
  ['Dhanbad', 'Jharkhand', 23.79, 86.43, 'plain'],
  ['East Singhbhum', 'Jharkhand', 22.8, 86.2, 'hill'],
  // Karnataka
  ['Bengaluru Urban', 'Karnataka', 12.97, 77.57, 'semi'],
  ['Mysuru', 'Karnataka', 12.29, 76.64, 'semi'],
  ['Dakshina Kannada', 'Karnataka', 12.91, 74.86, 'coast'],
  ['Uttara Kannada', 'Karnataka', 14.78, 74.65, 'coast'],
  ['Shivamogga', 'Karnataka', 13.93, 75.57, 'hill'],
  ['Belagavi', 'Karnataka', 15.85, 74.5, 'semi'],
  // Kerala (curated live districts stay as-is; these are for the dropdown)
  ['Wayanad', 'Kerala', 11.65, 76.1, 'hill'],
  ['Idukki', 'Kerala', 9.9, 77.05, 'hill'],
  ['Alappuzha', 'Kerala', 9.49, 76.32, 'coast'],
  ['Kozhikode', 'Kerala', 11.25, 75.78, 'coast'],
  ['Thrissur', 'Kerala', 10.52, 76.21, 'coast'],
  // Ladakh
  ['Leh', 'Ladakh', 34.16, 77.57, 'himalaya'],
  ['Kargil', 'Ladakh', 34.55, 76.13, 'himalaya'],
  // Lakshadweep
  ['Lakshadweep', 'Lakshadweep', 10.56, 72.63, 'island'],
  // Madhya Pradesh
  ['Bhopal', 'Madhya Pradesh', 23.25, 77.41, 'semi'],
  ['Indore', 'Madhya Pradesh', 22.71, 75.87, 'semi'],
  ['Gwalior', 'Madhya Pradesh', 26.18, 78.17, 'plain'],
  ['Jabalpur', 'Madhya Pradesh', 23.18, 79.99, 'plain'],
  // Maharashtra
  ['Mumbai Suburban', 'Maharashtra', 19.08, 72.88, 'coast'],
  ['Pune', 'Maharashtra', 18.52, 73.86, 'semi'],
  ['Nagpur', 'Maharashtra', 21.15, 79.09, 'plain'],
  ['Ratnagiri', 'Maharashtra', 17.0, 73.27, 'coast'],
  ['Sindhudurg', 'Maharashtra', 16.0, 73.8, 'coast'],
  // Manipur
  ['Imphal West', 'Manipur', 24.81, 93.94, 'hill'],
  ['Imphal East', 'Manipur', 24.75, 94.03, 'hill'],
  // Meghalaya
  ['East Khasi Hills', 'Meghalaya', 25.57, 91.88, 'hill'],
  ['West Garo Hills', 'Meghalaya', 25.51, 90.2, 'hill'],
  // Mizoram
  ['Aizawl', 'Mizoram', 23.72, 92.71, 'hill'],
  ['Lunglei', 'Mizoram', 22.88, 92.74, 'hill'],
  // Nagaland
  ['Kohima', 'Nagaland', 25.67, 94.1, 'hill'],
  ['Dimapur', 'Nagaland', 25.9, 93.74, 'plain'],
  // Odisha
  ['Khordha', 'Odisha', 20.29, 85.82, 'coast'],
  ['Balasore', 'Odisha', 21.49, 86.92, 'coast'],
  ['Puri', 'Odisha', 19.81, 85.83, 'coast'],
  ['Sundargarh', 'Odisha', 22.25, 84.03, 'plain'],
  // Puducherry
  ['Puducherry', 'Puducherry', 11.94, 79.83, 'coast'],
  // Punjab
  ['Ludhiana', 'Punjab', 30.9, 75.86, 'plain'],
  ['Amritsar', 'Punjab', 31.63, 74.87, 'plain'],
  ['Patiala', 'Punjab', 30.34, 76.39, 'plain'],
  ['Bathinda', 'Punjab', 30.21, 74.94, 'desert'],
  // Rajasthan
  ['Jaipur', 'Rajasthan', 26.92, 75.82, 'desert'],
  ['Jodhpur', 'Rajasthan', 26.32, 73.38, 'desert'],
  ['Udaipur', 'Rajasthan', 24.58, 73.71, 'hill'],
  ['Barmer', 'Rajasthan', 25.69, 71.9, 'desert'],
  // Sikkim
  ['East Sikkim', 'Sikkim', 27.34, 88.61, 'himalaya'],
  // Tamil Nadu
  ['Chennai', 'Tamil Nadu', 13.08, 80.27, 'coast'],
  ['Cuddalore', 'Tamil Nadu', 11.74, 79.77, 'coast'],
  ['Nagapattinam', 'Tamil Nadu', 10.77, 79.84, 'coast'],
  ['Coimbatore', 'Tamil Nadu', 11.02, 77.0, 'semi'],
  ['Madurai', 'Tamil Nadu', 9.93, 78.12, 'semi'],
  // Telangana
  ['Hyderabad', 'Telangana', 17.38, 78.48, 'semi'],
  ['Warangal', 'Telangana', 17.97, 79.59, 'semi'],
  // Tripura
  ['West Tripura', 'Tripura', 23.83, 91.29, 'plain'],
  ['South Tripura', 'Tripura', 23.54, 91.48, 'hill'],
  // Uttar Pradesh
  ['Lucknow', 'Uttar Pradesh', 26.85, 80.95, 'plain'],
  ['Kanpur Nagar', 'Uttar Pradesh', 26.45, 80.33, 'plain'],
  ['Varanasi', 'Uttar Pradesh', 25.32, 82.99, 'plain'],
  ['Agra', 'Uttar Pradesh', 27.18, 78.02, 'plain'],
  ['Prayagraj', 'Uttar Pradesh', 25.44, 81.84, 'plain'],
  ['Meerut', 'Uttar Pradesh', 28.98, 77.71, 'plain'],
  // Uttarakhand
  ['Dehradun', 'Uttarakhand', 30.32, 78.04, 'himalaya'],
  ['Haridwar', 'Uttarakhand', 29.94, 78.16, 'plain'],
  ['Chamoli', 'Uttarakhand', 30.42, 79.32, 'himalaya'],
  ['Nainital', 'Uttarakhand', 29.39, 79.45, 'himalaya'],
  // West Bengal
  ['Kolkata', 'West Bengal', 22.57, 88.36, 'coast'],
  ['North 24 Parganas', 'West Bengal', 22.44, 88.83, 'coast'],
  ['South 24 Parganas', 'West Bengal', 22.17, 88.43, 'coast'],
  ['Darjeeling', 'West Bengal', 27.04, 88.26, 'himalaya'],
  ['Malda', 'West Bengal', 25.01, 88.14, 'plain'],
];