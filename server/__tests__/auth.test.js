/**
 * auth.test.js - Verification test for signup and login flow using MongoDB and JWT
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const authRoutes = require('../routes/authRoutes');
const { connectDB, isMongooseReady } = require('../config/db');
const { users } = require('../dataAccess');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

async function runTests() {
  console.log('--- Starting Auth & MongoDB Verification Tests ---');

  // 0. Ensure database connection
  console.log('0. Connecting to MongoDB Atlas database...');
  await connectDB();
  const dbConnected = isMongooseReady();
  console.log(`✓ Database Status: ${dbConnected ? 'Connected to MongoDB Atlas' : 'In-Memory Fallback'}`);

  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });

  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/auth`;

  let createdUserId = null;

  try {
    const testEmail = `test_user_${Date.now()}@bhudan.gov.in`;
    const testPassword = 'SecurePassword@123';
    const testName = 'Dr. Vikram Sharma';
    const testRole = 'analyst';

    // 1. Verify /api/auth/status
    console.log('1. Testing /api/auth/status health check...');
    const statusRes = await fetch(`${baseUrl}/status`);
    const statusData = await statusRes.json();
    if (statusRes.status !== 200 || !statusData.success) {
      throw new Error(`Auth status failed: ${statusRes.status} ${JSON.stringify(statusData)}`);
    }
    console.log(`✓ Auth status OK: database is '${statusData.database}'`);

    // 2. Register a new user
    console.log('2. Testing User Registration (Name, Email, Role, Password)...');
    const regRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        role: testRole,
        email: testEmail,
        password: testPassword,
      }),
    });
    const regData = await regRes.json();

    if (regRes.status !== 201 || !regData.success || !regData.token) {
      throw new Error(`Registration failed: ${regRes.status} ${JSON.stringify(regData)}`);
    }
    createdUserId = regData.user.id;
    console.log(`✓ Registered successfully! ID: ${regData.user.id}, Role: ${regData.user.role}`);
    console.log(`✓ Instant JWT token generated: ${regData.token.substring(0, 20)}...`);

    // 3. Verify in MongoDB that password was securely hashed (not plain text)
    console.log('3. Verifying Password Hashing in Database...');
    const userInDb = await users.findByField('email', testEmail);
    if (!userInDb || !userInDb.passwordHash) {
      throw new Error('User record was not found in database or passwordHash is missing');
    }
    if (userInDb.passwordHash === testPassword) {
      throw new Error('SECURITY VIOLATION: Password was stored in plain text!');
    }
    const hashMatches = await bcrypt.compare(testPassword, userInDb.passwordHash);
    if (!hashMatches) {
      throw new Error('Bcrypt hash verification failed against stored passwordHash');
    }
    console.log('✓ Password is securely hashed with bcrypt (length: ' + userInDb.passwordHash.length + ') and verified!');

    // 4. Duplicate registration check
    console.log('4. Testing Duplicate Email Prevention...');
    const dupRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        role: testRole,
        email: testEmail,
        password: testPassword,
      }),
    });
    if (dupRes.status !== 409) {
      throw new Error(`Duplicate registration expected 409, got ${dupRes.status}`);
    }
    console.log('✓ Duplicate registration correctly rejected with 409 Conflict');

    // 5. Login with newly registered credentials
    console.log('5. Testing Login with Registered Credentials...');
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const loginData = await loginRes.json();
    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error(`Login failed: ${loginRes.status} ${JSON.stringify(loginData)}`);
    }
    console.log('✓ Logged in successfully! Received JWT token for user:', loginData.user.name);
    const token = loginData.token;

    // 6. Login with invalid password
    console.log('6. Testing Invalid Password Rejection...');
    const badLoginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'IncorrectPassword999!',
      }),
    });
    if (badLoginRes.status !== 401) {
      throw new Error(`Invalid password expected 401, got ${badLoginRes.status}`);
    }
    console.log('✓ Invalid password correctly rejected with 401 Unauthorized');

    // 7. Test /api/auth/me with JWT token
    console.log('7. Testing /api/auth/me with JWT session token...');
    const meRes = await fetch(`${baseUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    if (meRes.status !== 200 || meData.user.email !== testEmail) {
      throw new Error(`/api/auth/me failed: ${meRes.status} ${JSON.stringify(meData)}`);
    }
    console.log(`✓ /api/auth/me authenticated successfully: ${meData.user.name} (${meData.user.role})`);

    // 8. Clean up created test user from database
    if (createdUserId) {
      await users.remove(createdUserId);
      console.log('✓ Cleaned up test user record from database.');
    }

    console.log('\n--- ALL AUTH & MONGODB TESTS PASSED SUCCESSFULLY! ---');
  } finally {
    server.close();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

