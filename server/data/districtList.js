/**
 * DISTRICT_LIST — Comprehensive nationwide registry covering all 28 States
 * and 8 Union Territories across India.
 * Format: [name, state, lat, lng, region]
 * Regions: himalaya, hill, coast, plain, desert, island, semi
 */

module.exports = [
  // --- 28 STATES ---

  // 1. Andhra Pradesh
  ['Visakhapatnam', 'Andhra Pradesh', 17.68, 83.21, 'coast'],
  ['Guntur', 'Andhra Pradesh', 16.3, 80.44, 'coast'],
  ['Krishna', 'Andhra Pradesh', 16.51, 80.63, 'coast'],
  ['East Godavari', 'Andhra Pradesh', 17.0, 81.8, 'coast'],
  ['Chittoor', 'Andhra Pradesh', 13.21, 79.1, 'semi'],
  ['Anantapur', 'Andhra Pradesh', 14.68, 77.6, 'semi'],

  // 2. Arunachal Pradesh
  ['Papum Pare', 'Arunachal Pradesh', 27.08, 93.6, 'hill'],
  ['Tawang', 'Arunachal Pradesh', 27.58, 91.86, 'himalaya'],
  ['West Kameng', 'Arunachal Pradesh', 27.27, 92.41, 'himalaya'],
  ['East Siang', 'Arunachal Pradesh', 28.06, 95.33, 'hill'],

  // 3. Assam
  ['Kamrup', 'Assam', 26.14, 91.73, 'plain'],
  ['Barpeta', 'Assam', 26.32, 91.0, 'plain'],
  ['Cachar', 'Assam', 24.83, 92.77, 'hill'],
  ['Dibrugarh', 'Assam', 27.47, 94.91, 'plain'],
  ['Dhubri', 'Assam', 26.02, 89.97, 'plain'],
  ['Dima Hasao', 'Assam', 25.18, 93.03, 'hill'],

  // 4. Bihar
  ['Patna', 'Bihar', 25.59, 85.13, 'plain'],
  ['Gaya', 'Bihar', 24.79, 85.0, 'plain'],
  ['Bhagalpur', 'Bihar', 25.24, 86.98, 'plain'],
  ['Muzaffarpur', 'Bihar', 26.12, 85.39, 'plain'],
  ['Katihar', 'Bihar', 25.54, 87.57, 'plain'],
  ['Darbhanga', 'Bihar', 26.15, 85.9, 'plain'],

  // 5. Chhattisgarh
  ['Raipur', 'Chhattisgarh', 21.25, 81.62, 'plain'],
  ['Bastar', 'Chhattisgarh', 19.08, 82.01, 'hill'],
  ['Bilaspur', 'Chhattisgarh', 22.08, 82.14, 'plain'],
  ['Surguja', 'Chhattisgarh', 23.12, 83.19, 'hill'],

  // 6. Goa
  ['North Goa', 'Goa', 15.49, 73.82, 'coast'],
  ['South Goa', 'Goa', 15.2, 74.0, 'coast'],

  // 7. Gujarat
  ['Ahmedabad', 'Gujarat', 23.03, 72.58, 'semi'],
  ['Surat', 'Gujarat', 21.17, 72.83, 'coast'],
  ['Kutch', 'Gujarat', 23.24, 69.66, 'desert'],
  ['Vadodara', 'Gujarat', 22.31, 73.18, 'plain'],
  ['Rajkot', 'Gujarat', 22.3, 70.8, 'semi'],
  ['Junagadh', 'Gujarat', 21.52, 70.46, 'coast'],

  // 8. Haryana
  ['Gurugram', 'Haryana', 28.46, 77.02, 'plain'],
  ['Hisar', 'Haryana', 29.15, 75.72, 'desert'],
  ['Faridabad', 'Haryana', 28.41, 77.31, 'plain'],
  ['Ambala', 'Haryana', 30.37, 76.78, 'plain'],

  // 9. Himachal Pradesh
  ['Shimla', 'Himachal Pradesh', 31.1, 77.17, 'himalaya'],
  ['Kangra', 'Himachal Pradesh', 32.1, 76.28, 'hill'],
  ['Kullu', 'Himachal Pradesh', 31.95, 77.1, 'himalaya'],
  ['Mandi', 'Himachal Pradesh', 31.7, 76.93, 'himalaya'],
  ['Chamba', 'Himachal Pradesh', 32.55, 76.13, 'himalaya'],
  ['Kinnaur', 'Himachal Pradesh', 31.65, 78.47, 'himalaya'],

  // 10. Jharkhand
  ['Ranchi', 'Jharkhand', 23.34, 85.3, 'hill'],
  ['Dhanbad', 'Jharkhand', 23.79, 86.43, 'plain'],
  ['East Singhbhum', 'Jharkhand', 22.8, 86.2, 'hill'],
  ['Palamu', 'Jharkhand', 24.04, 84.07, 'semi'],

  // 11. Karnataka
  ['Bengaluru Urban', 'Karnataka', 12.97, 77.57, 'semi'],
  ['Mysuru', 'Karnataka', 12.29, 76.64, 'semi'],
  ['Dakshina Kannada', 'Karnataka', 12.91, 74.86, 'coast'],
  ['Uttara Kannada', 'Karnataka', 14.78, 74.65, 'coast'],
  ['Shivamogga', 'Karnataka', 13.93, 75.57, 'hill'],
  ['Belagavi', 'Karnataka', 15.85, 74.5, 'semi'],
  ['Kodagu', 'Karnataka', 12.42, 75.74, 'hill'],

  // 12. Kerala
  ['Wayanad', 'Kerala', 11.65, 76.1, 'hill'],
  ['Idukki', 'Kerala', 9.9, 77.05, 'hill'],
  ['Alappuzha', 'Kerala', 9.49, 76.32, 'coast'],
  ['Kozhikode', 'Kerala', 11.25, 75.78, 'coast'],
  ['Thrissur', 'Kerala', 10.52, 76.21, 'coast'],
  ['Ernakulam', 'Kerala', 9.98, 76.28, 'coast'],
  ['Pathanamthitta', 'Kerala', 9.27, 76.79, 'hill'],
  ['Malappuram', 'Kerala', 11.07, 76.07, 'coast'],

  // 13. Madhya Pradesh
  ['Bhopal', 'Madhya Pradesh', 23.25, 77.41, 'semi'],
  ['Indore', 'Madhya Pradesh', 22.71, 75.87, 'semi'],
  ['Gwalior', 'Madhya Pradesh', 26.18, 78.17, 'plain'],
  ['Jabalpur', 'Madhya Pradesh', 23.18, 79.99, 'plain'],
  ['Ujjain', 'Madhya Pradesh', 23.18, 75.78, 'semi'],

  // 14. Maharashtra
  ['Mumbai Suburban', 'Maharashtra', 19.08, 72.88, 'coast'],
  ['Pune', 'Maharashtra', 18.52, 73.86, 'semi'],
  ['Nagpur', 'Maharashtra', 21.15, 79.09, 'plain'],
  ['Ratnagiri', 'Maharashtra', 17.0, 73.27, 'coast'],
  ['Sindhudurg', 'Maharashtra', 16.0, 73.8, 'coast'],
  ['Raigad', 'Maharashtra', 18.52, 73.18, 'coast'],
  ['Thane', 'Maharashtra', 19.21, 72.97, 'coast'],
  ['Nashik', 'Maharashtra', 19.99, 73.79, 'semi'],
  ['Satara', 'Maharashtra', 17.68, 73.99, 'hill'],

  // 15. Manipur
  ['Imphal West', 'Manipur', 24.81, 93.94, 'hill'],
  ['Imphal East', 'Manipur', 24.75, 94.03, 'hill'],
  ['Churachandpur', 'Manipur', 24.33, 93.67, 'hill'],

  // 16. Meghalaya
  ['East Khasi Hills', 'Meghalaya', 25.57, 91.88, 'hill'],
  ['West Garo Hills', 'Meghalaya', 25.51, 90.2, 'hill'],
  ['Ribhoi', 'Meghalaya', 25.9, 91.88, 'hill'],

  // 17. Mizoram
  ['Aizawl', 'Mizoram', 23.72, 92.71, 'hill'],
  ['Lunglei', 'Mizoram', 22.88, 92.74, 'hill'],
  ['Champhai', 'Mizoram', 23.47, 93.32, 'hill'],

  // 18. Nagaland
  ['Kohima', 'Nagaland', 25.67, 94.1, 'hill'],
  ['Dimapur', 'Nagaland', 25.9, 93.74, 'plain'],
  ['Mokokchung', 'Nagaland', 26.32, 94.52, 'hill'],

  // 19. Odisha
  ['Khordha', 'Odisha', 20.29, 85.82, 'coast'],
  ['Balasore', 'Odisha', 21.49, 86.92, 'coast'],
  ['Puri', 'Odisha', 19.81, 85.83, 'coast'],
  ['Ganjam', 'Odisha', 19.38, 85.06, 'coast'],
  ['Kendrapara', 'Odisha', 20.5, 86.42, 'coast'],
  ['Sundargarh', 'Odisha', 22.25, 84.03, 'plain'],

  // 20. Punjab
  ['Ludhiana', 'Punjab', 30.9, 75.86, 'plain'],
  ['Amritsar', 'Punjab', 31.63, 74.87, 'plain'],
  ['Patiala', 'Punjab', 30.34, 76.39, 'plain'],
  ['Bathinda', 'Punjab', 30.21, 74.94, 'desert'],

  // 21. Rajasthan
  ['Jaipur', 'Rajasthan', 26.92, 75.82, 'desert'],
  ['Jodhpur', 'Rajasthan', 26.32, 73.38, 'desert'],
  ['Udaipur', 'Rajasthan', 24.58, 73.71, 'hill'],
  ['Barmer', 'Rajasthan', 25.69, 71.9, 'desert'],
  ['Bikaner', 'Rajasthan', 28.02, 73.31, 'desert'],
  ['Jaisalmer', 'Rajasthan', 26.91, 70.9, 'desert'],

  // 22. Sikkim
  ['East Sikkim', 'Sikkim', 27.34, 88.61, 'himalaya'],
  ['North Sikkim', 'Sikkim', 27.7, 88.58, 'himalaya'],
  ['South Sikkim', 'Sikkim', 27.17, 88.35, 'himalaya'],
  ['West Sikkim', 'Sikkim', 27.28, 88.22, 'himalaya'],

  // 23. Tamil Nadu
  ['Chennai', 'Tamil Nadu', 13.08, 80.27, 'coast'],
  ['Cuddalore', 'Tamil Nadu', 11.74, 79.77, 'coast'],
  ['Nagapattinam', 'Tamil Nadu', 10.77, 79.84, 'coast'],
  ['Coimbatore', 'Tamil Nadu', 11.02, 77.0, 'semi'],
  ['Madurai', 'Tamil Nadu', 9.93, 78.12, 'semi'],
  ['Nilgiris', 'Tamil Nadu', 11.41, 76.7, 'hill'],
  ['Kanyakumari', 'Tamil Nadu', 8.08, 77.55, 'coast'],

  // 24. Telangana
  ['Hyderabad', 'Telangana', 17.38, 78.48, 'semi'],
  ['Warangal', 'Telangana', 17.97, 79.59, 'semi'],
  ['Khammam', 'Telangana', 17.25, 80.15, 'plain'],

  // 25. Tripura
  ['West Tripura', 'Tripura', 23.83, 91.29, 'plain'],
  ['South Tripura', 'Tripura', 23.54, 91.48, 'hill'],

  // 26. Uttar Pradesh
  ['Lucknow', 'Uttar Pradesh', 26.85, 80.95, 'plain'],
  ['Kanpur Nagar', 'Uttar Pradesh', 26.45, 80.33, 'plain'],
  ['Varanasi', 'Uttar Pradesh', 25.32, 82.99, 'plain'],
  ['Agra', 'Uttar Pradesh', 27.18, 78.02, 'plain'],
  ['Prayagraj', 'Uttar Pradesh', 25.44, 81.84, 'plain'],
  ['Gorakhpur', 'Uttar Pradesh', 26.76, 83.37, 'plain'],

  // 27. Uttarakhand
  ['Dehradun', 'Uttarakhand', 30.32, 78.04, 'himalaya'],
  ['Haridwar', 'Uttarakhand', 29.94, 78.16, 'plain'],
  ['Chamoli', 'Uttarakhand', 30.42, 79.32, 'himalaya'],
  ['Nainital', 'Uttarakhand', 29.39, 79.45, 'himalaya'],
  ['Uttarkashi', 'Uttarakhand', 30.73, 78.45, 'himalaya'],
  ['Rudraprayag', 'Uttarakhand', 30.28, 78.98, 'himalaya'],
  ['Pithoragarh', 'Uttarakhand', 29.58, 80.22, 'himalaya'],

  // 28. West Bengal
  ['Kolkata', 'West Bengal', 22.57, 88.36, 'coast'],
  ['North 24 Parganas', 'West Bengal', 22.44, 88.83, 'coast'],
  ['South 24 Parganas', 'West Bengal', 22.17, 88.43, 'coast'],
  ['Darjeeling', 'West Bengal', 27.04, 88.26, 'himalaya'],
  ['Kalimpong', 'West Bengal', 27.06, 88.47, 'himalaya'],
  ['Jalpaiguri', 'West Bengal', 26.54, 88.72, 'plain'],
  ['Malda', 'West Bengal', 25.01, 88.14, 'plain'],
  ['Purba Medinipur', 'West Bengal', 21.94, 87.77, 'coast'],

  // --- 8 UNION TERRITORIES ---

  // 1. Andaman & Nicobar
  ['South Andaman', 'Andaman & Nicobar', 11.62, 92.72, 'island'],
  ['North & Middle Andaman', 'Andaman & Nicobar', 12.92, 92.93, 'island'],
  ['Nicobar', 'Andaman & Nicobar', 7.01, 93.78, 'island'],

  // 2. Chandigarh
  ['Chandigarh', 'Chandigarh', 30.73, 76.78, 'plain'],

  // 3. Dadra & Nagar Haveli and Daman & Diu
  ['Daman', 'Dadra & Nagar Haveli and Daman & Diu', 20.39, 72.83, 'coast'],
  ['Diu', 'Dadra & Nagar Haveli and Daman & Diu', 20.71, 70.98, 'coast'],
  ['Dadra & Nagar Haveli', 'Dadra & Nagar Haveli and Daman & Diu', 20.27, 73.02, 'semi'],

  // 4. Delhi
  ['New Delhi', 'Delhi', 28.61, 77.2, 'plain'],
  ['South Delhi', 'Delhi', 28.48, 77.2, 'plain'],
  ['North Delhi', 'Delhi', 28.7, 77.13, 'plain'],

  // 5. Jammu & Kashmir
  ['Srinagar', 'Jammu & Kashmir', 34.08, 74.79, 'himalaya'],
  ['Jammu', 'Jammu & Kashmir', 32.72, 74.85, 'plain'],
  ['Anantnag', 'Jammu & Kashmir', 33.73, 75.14, 'himalaya'],
  ['Baramulla', 'Jammu & Kashmir', 34.2, 74.34, 'himalaya'],
  ['Kupwara', 'Jammu & Kashmir', 34.53, 74.25, 'himalaya'],

  // 6. Ladakh
  ['Leh', 'Ladakh', 34.16, 77.57, 'himalaya'],
  ['Kargil', 'Ladakh', 34.55, 76.13, 'himalaya'],

  // 7. Lakshadweep
  ['Lakshadweep', 'Lakshadweep', 10.56, 72.63, 'island'],

  // 8. Puducherry
  ['Puducherry', 'Puducherry', 11.94, 79.83, 'coast'],
  ['Karaikal', 'Puducherry', 10.92, 79.83, 'coast'],
];